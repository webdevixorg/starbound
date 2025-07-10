# chat/models.py

class Conversation:
    def __init__(self, id, participants):
        self.id = id
        self.participants = participants

class Message:
    def __init__(self, id, sender, content):
        self.id = id
        self.sender = sender
        self.content = content
