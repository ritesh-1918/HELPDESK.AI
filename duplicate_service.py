from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class DuplicateService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.existing_tickets = []
        self.existing_vectors = None

    def add_ticket(self, ticket_text):
        """Add a new ticket to the existing tickets list."""
        self.existing_tickets.append(ticket_text)
        self.existing_vectors = self.vectorizer.fit_transform(self.existing_tickets)

    def process_new_ticket(self, new_ticket_text):
        """Process a new ticket, map it to a vector, and check for duplicates."""
        # Vectorize the new ticket
        new_ticket_vector = self.vectorizer.transform([new_ticket_text])

        # Calculate cosine similarities
        similarities = cosine_similarity(new_ticket_vector, self.existing_vectors).flatten()

        # Find the most similar ticket
        most_similar_index = np.argmax(similarities)
        most_similar_score = similarities[most_similar_index]

        # Check if the most similar score is above a threshold (e.g., 0.8)
        if most_similar_score > 0.8:
            self.alert_agent(new_ticket_text, self.existing_tickets[most_similar_index], most_similar_score)
        else:
            print("No duplicate found.")

    def alert_agent(self, new_ticket_text, existing_ticket_text, similarity_score):
        """Alert the support agent about a potential duplicate."""
        print(f"ALERT: Potential duplicate detected!")
        print(f"New Ticket: {new_ticket_text}")
        print(f"Existing Ticket: {existing_ticket_text}")
        print(f"Similarity Score: {similarity_score:.2f}")

# Example usage
if __name__ == "__main__":
    # Initialize the service
    duplicate_service = DuplicateService()

    # Add some existing tickets
    duplicate_service.add_ticket("My computer won't turn on.")
    duplicate_service.add_ticket("The screen is blank when I try to start my PC.")
    duplicate_service.add_ticket("I can't connect to the internet on my laptop.")

    # Process a new ticket
    new_ticket = "My PC doesn't power up."
    duplicate_service.process_new_ticket(new_ticket)
