"""
Ticket Merge Service

Handles merging of duplicate tickets, preserving data integrity and audit trail.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class TicketMergeService:
    """
    Service for merging duplicate tickets.
    
    Merge process:
    1. Validate tickets can be merged
    2. Copy comments from secondary to primary
    3. Copy attachments from secondary to primary
    4. Create merge record in database
    5. Close secondary ticket as duplicate
    6. Add merge note to both tickets
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
    
    def merge_tickets(
        self,
        primary_ticket_id: str,
        secondary_ticket_id: str,
        merged_by_user_id: str,
        company_id: str,
        merge_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Merge two tickets, making secondary a duplicate of primary.
        
        Args:
            primary_ticket_id: ID of ticket to keep (primary)
            secondary_ticket_id: ID of ticket to close (secondary/duplicate)
            merged_by_user_id: User performing the merge
            company_id: Company ID for security
            merge_note: Optional note explaining the merge
        
        Returns:
            Dict with merge result and details
        """
        if not self.supabase:
            return {'success': False, 'error': 'Database not available'}
        
        try:
            # 1. Validate tickets
            validation = self._validate_merge(
                primary_ticket_id, secondary_ticket_id, company_id
            )
            if not validation['valid']:
                return {'success': False, 'error': validation['error']}
            
            primary_ticket = validation['primary_ticket']
            secondary_ticket = validation['secondary_ticket']
            
            # 2. Copy comments
            comments_copied = self._copy_comments(
                secondary_ticket_id, primary_ticket_id
            )
            
            # 3. Copy attachments
            attachments_copied = self._copy_attachments(
                secondary_ticket_id, primary_ticket_id
            )
            
            # 4. Create merge record
            merge_record = self._create_merge_record(
                primary_ticket_id,
                secondary_ticket_id,
                merged_by_user_id,
                company_id,
                merge_note
            )
            
            # 5. Add merge notes to both tickets
            self._add_merge_note_to_primary(primary_ticket_id, secondary_ticket, merge_record['id'])
            self._add_merge_note_to_secondary(secondary_ticket_id, primary_ticket, merge_record['id'])
            
            # 6. Close secondary ticket
            self._close_secondary_ticket(secondary_ticket_id, primary_ticket_id)
            
            return {
                'success': True,
                'merge_id': merge_record['id'],
                'primary_ticket_id': primary_ticket_id,
                'secondary_ticket_id': secondary_ticket_id,
                'comments_copied': comments_copied,
                'attachments_copied': attachments_copied,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error merging tickets: {e}", exc_info=True)
            return {'success': False, 'error': str(e)}
    
    def _validate_merge(
        self,
        primary_id: str,
        secondary_id: str,
        company_id: str
    ) -> Dict[str, Any]:
        """Validate that tickets can be merged."""
        try:
            # Get both tickets
            primary_result = self.supabase.table('tickets').select(
                '*'
            ).eq('id', primary_id).eq('company_id', company_id).single().execute()
            
            secondary_result = self.supabase.table('tickets').select(
                '*'
            ).eq('id', secondary_id).eq('company_id', company_id).single().execute()
            
            primary_ticket = primary_result.data
            secondary_ticket = secondary_result.data
            
            if not primary_ticket:
                return {'valid': False, 'error': 'Primary ticket not found'}
            
            if not secondary_ticket:
                return {'valid': False, 'error': 'Secondary ticket not found'}
            
            # Cannot merge the same ticket
            if primary_id == secondary_id:
                return {'valid': False, 'error': 'Cannot merge ticket with itself'}
            
            # Cannot merge if secondary is already merged
            if secondary_ticket.get('merged_into'):
                return {'valid': False, 'error': 'Secondary ticket already merged'}
            
            # Check if tickets are from same company
            if primary_ticket['company_id'] != secondary_ticket['company_id']:
                return {'valid': False, 'error': 'Tickets from different companies'}
            
            return {
                'valid': True,
                'primary_ticket': primary_ticket,
                'secondary_ticket': secondary_ticket
            }
        
        except Exception as e:
            logger.error(f"Error validating merge: {e}")
            return {'valid': False, 'error': str(e)}
    
    def _copy_comments(self, from_ticket_id: str, to_ticket_id: str) -> int:
        """Copy comments from secondary to primary ticket."""
        try:
            # Check if comments table exists and copy
            comments_result = self.supabase.table('ticket_comments').select(
                '*'
            ).eq('ticket_id', from_ticket_id).execute()
            
            comments = comments_result.data or []
            
            for comment in comments:
                # Create new comment on primary ticket
                new_comment = {
                    'ticket_id': to_ticket_id,
                    'user_id': comment['user_id'],
                    'content': f"[Merged from duplicate ticket] {comment['content']}",
                    'created_at': comment['created_at'],
                    'is_internal': comment.get('is_internal', False)
                }
                
                self.supabase.table('ticket_comments').insert(new_comment).execute()
            
            return len(comments)
        
        except Exception as e:
            logger.error(f"Error copying comments: {e}")
            return 0
    
    def _copy_attachments(self, from_ticket_id: str, to_ticket_id: str) -> int:
        """Copy attachments from secondary to primary ticket."""
        try:
            # Check if attachments table exists and copy
            attachments_result = self.supabase.table('ticket_attachments').select(
                '*'
            ).eq('ticket_id', from_ticket_id).execute()
            
            attachments = attachments_result.data or []
            
            for attachment in attachments:
                # Create new attachment reference on primary ticket
                new_attachment = {
                    'ticket_id': to_ticket_id,
                    'file_name': attachment['file_name'],
                    'file_path': attachment['file_path'],
                    'file_size': attachment['file_size'],
                    'file_type': attachment['file_type'],
                    'uploaded_by': attachment['uploaded_by'],
                    'uploaded_at': attachment['uploaded_at']
                }
                
                self.supabase.table('ticket_attachments').insert(new_attachment).execute()
            
            return len(attachments)
        
        except Exception as e:
            logger.error(f"Error copying attachments: {e}")
            return 0
    
    def _create_merge_record(
        self,
        primary_id: str,
        secondary_id: str,
        merged_by: str,
        company_id: str,
        merge_note: Optional[str]
    ) -> Dict[str, Any]:
        """Create merge record in database."""
        try:
            merge_data = {
                'primary_ticket_id': primary_id,
                'secondary_ticket_id': secondary_id,
                'merged_by_user_id': merged_by,
                'company_id': company_id,
                'merge_note': merge_note or 'Duplicate ticket merged',
                'merged_at': datetime.now(timezone.utc).isoformat()
            }
            
            result = self.supabase.table('ticket_merges').insert(merge_data).execute()
            return result.data[0] if result.data else merge_data
        
        except Exception as e:
            logger.error(f"Error creating merge record: {e}")
            # Return minimal record even if DB insert fails
            return {'id': 'unknown', **merge_data}
    
    def _add_merge_note_to_primary(
        self,
        primary_id: str,
        secondary_ticket: Dict[str, Any],
        merge_id: str
    ):
        """Add note to primary ticket about the merge."""
        try:
            note = (
                f"Merged duplicate ticket #{secondary_ticket['id'][-8:]} "
                f"(Subject: {secondary_ticket.get('subject', 'N/A')}) into this ticket. "
                f"Comments and attachments have been copied."
            )
            
            # Add as system comment
            self.supabase.table('ticket_comments').insert({
                'ticket_id': primary_id,
                'user_id': None,  # System comment
                'content': note,
                'is_internal': True,
                'is_system': True,
                'created_at': datetime.now(timezone.utc).isoformat()
            }).execute()
        
        except Exception as e:
            logger.error(f"Error adding merge note to primary: {e}")
    
    def _add_merge_note_to_secondary(
        self,
        secondary_id: str,
        primary_ticket: Dict[str, Any],
        merge_id: str
    ):
        """Add note to secondary ticket about the merge."""
        try:
            note = (
                f"This ticket has been marked as a duplicate and merged into "
                f"ticket #{primary_ticket['id'][-8:]} "
                f"(Subject: {primary_ticket.get('subject', 'N/A')}). "
                f"Please refer to that ticket for updates."
            )
            
            # Add as system comment
            self.supabase.table('ticket_comments').insert({
                'ticket_id': secondary_id,
                'user_id': None,  # System comment
                'content': note,
                'is_internal': True,
                'is_system': True,
                'created_at': datetime.now(timezone.utc).isoformat()
            }).execute()
        
        except Exception as e:
            logger.error(f"Error adding merge note to secondary: {e}")
    
    def _close_secondary_ticket(self, secondary_id: str, primary_id: str):
        """Close secondary ticket and link to primary."""
        try:
            self.supabase.table('tickets').update({
                'status': 'closed',
                'resolution': 'Duplicate - Merged',
                'merged_into': primary_id,
                'closed_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', secondary_id).execute()
        
        except Exception as e:
            logger.error(f"Error closing secondary ticket: {e}")
    
    def get_merge_history(
        self,
        ticket_id: str,
        company_id: str
    ) -> List[Dict[str, Any]]:
        """Get merge history for a ticket."""
        if not self.supabase:
            return []
        
        try:
            # Get merges where this ticket is primary
            as_primary = self.supabase.table('ticket_merges').select(
                '*'
            ).eq('primary_ticket_id', ticket_id).eq('company_id', company_id).execute()
            
            # Get merge where this ticket is secondary
            as_secondary = self.supabase.table('ticket_merges').select(
                '*'
            ).eq('secondary_ticket_id', ticket_id).eq('company_id', company_id).execute()
            
            merges = (as_primary.data or []) + (as_secondary.data or [])
            return merges
        
        except Exception as e:
            logger.error(f"Error getting merge history: {e}")
            return []
    
    def unlink_tickets(
        self,
        ticket_id_1: str,
        ticket_id_2: str,
        company_id: str
    ) -> Dict[str, Any]:
        """Remove duplicate link between two tickets."""
        if not self.supabase:
            return {'success': False, 'error': 'Database not available'}
        
        try:
            # Remove from ticket_links table
            self.supabase.table('ticket_links').delete().eq(
                'source_ticket_id', ticket_id_1
            ).eq('target_ticket_id', ticket_id_2).execute()
            
            self.supabase.table('ticket_links').delete().eq(
                'source_ticket_id', ticket_id_2
            ).eq('target_ticket_id', ticket_id_1).execute()
            
            return {'success': True}
        
        except Exception as e:
            logger.error(f"Error unlinking tickets: {e}")
            return {'success': False, 'error': str(e)}


def create_merge_service(supabase_client=None) -> TicketMergeService:
    """Factory function to create merge service."""
    return TicketMergeService(supabase_client)
