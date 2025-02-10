namespace Backend.Dtos
{
    public class JoinChatRequestDto
    {
        public int UserId { get; set; }
        public string ChatRoomName { get; set; }
        public string? Password { get; set; }
    }
}
