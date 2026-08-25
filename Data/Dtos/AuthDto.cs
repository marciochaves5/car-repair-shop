namespace Car_Repair_Shop.Data.Dtos;

public class RegisterDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
public class AuthResponseDto
{
    public required string Token { get; set; }
    public required string Email { get; set; }
}

