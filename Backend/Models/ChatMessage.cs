namespace Backend.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int UserId { get; set; } // FK: Verweis auf User
        public int ChatRoomId { get; set; } // FK: Verweis auf ChatRoom
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
