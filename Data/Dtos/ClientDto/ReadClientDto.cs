namespace Car_Repair_Shop.Data.Dtos.ClientDto;

public class ReadClientDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Cpf { get; set; }
    public required string Contact { get; set; }
    public string? Email { get; set; }
}
