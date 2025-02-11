namespace Backend.Models
{
    //Model of ChatRoom Table in DB
    public class ChatRoom
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }       
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;        
    }
}
