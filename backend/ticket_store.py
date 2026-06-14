import threading
from typing import Optional
from backend.models import TicketRecord


class TicketStore:
    def __init__(self):
        self._tickets: dict[str, TicketRecord] = {}
        self._lock = threading.RLock()

    def get(self, ticket_id: str) -> Optional[TicketRecord]:
        with self._lock:
            return self._tickets.get(ticket_id)

    def get_all(self) -> list[TicketRecord]:
        with self._lock:
            return list(self._tickets.values())

    def add(self, ticket: TicketRecord) -> TicketRecord:
        with self._lock:
            existing = self._tickets.get(ticket.ticket_id)
            if existing:
                return existing
            self._tickets[ticket.ticket_id] = ticket
            return ticket

    def update(self, ticket_id: str, updates: dict) -> Optional[TicketRecord]:
        with self._lock:
            existing = self._tickets.get(ticket_id)
            if existing is None:
                return None
            ticket_dict = existing.dict()
            ticket_dict.update(updates)
            updated = TicketRecord(**ticket_dict)
            self._tickets[ticket_id] = updated
            return updated

    def remove(self, ticket_id: str) -> bool:
        with self._lock:
            if ticket_id in self._tickets:
                del self._tickets[ticket_id]
                return True
            return False

    def __len__(self) -> int:
        with self._lock:
            return len(self._tickets)


ticket_store = TicketStore()
