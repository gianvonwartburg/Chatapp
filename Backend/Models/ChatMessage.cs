namespace Backend.Models
{
    //Model of ChatMessage Table in DB
    public class ChatMessage
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ChatRoomId { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
