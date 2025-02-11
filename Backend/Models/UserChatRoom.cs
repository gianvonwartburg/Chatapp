namespace Backend.Models
{
    //Model of UserChatRoom Table in DB
    public class UserChatRoom
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } //Navigation Property for EntityFramework

        public int ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; } //Navigation Property for EntityFramework
    }
}
