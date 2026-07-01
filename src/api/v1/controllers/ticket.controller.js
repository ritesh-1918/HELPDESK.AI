```javascript
import { Ticket } from '../models/ticket.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';

// A simple in-memory lock manager for handling concurrent requests.
// For a distributed environment, this should be replaced with a distributed lock manager like Redis.
const processingTickets = new Set();

/
 * @description Creates a new support ticket with race condition protection.
 * @route POST /api/v1/tickets
 * @access Private
 */
const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;
  const createdBy = req.user._id;

  if (!title || !description) {
    throw new ApiError(400, 'Title and description are required');
  }

  // Create a unique identifier for the ticket content to manage locking.
  const ticketIdentifier = crypto
    .createHash('sha256')
    .update(title.trim().toLowerCase() + description.trim().toLowerCase())
    .digest('hex');

  // --- ATOMIC LOCKING MECHANISM START ---
  if (processingTickets.has(ticketIdentifier)) {
    // If another request with the same content is already being processed, reject this one.
    throw new ApiError(409, 'A similar ticket is currently being processed. Please try again shortly.');
  }

  processingTickets.add(ticketIdentifier);
  // --- ATOMIC LOCKING MECHANISM END ---

  try {
    // Check for existing tickets with the same identifier in the database.
    // This is the critical section that the lock protects.
    const existingTicket = await Ticket.findOne({ contentHash: ticketIdentifier });

    if (existingTicket) {
      throw new ApiError(409, 'A ticket with this exact title and description already exists.');
    }

    // If no duplicate is found, proceed to create the new ticket.
    const newTicket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy,