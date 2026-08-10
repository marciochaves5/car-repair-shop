namespace Car_Repair_Shop.Data.Dtos.MechanicDto;

public class ReadMechanicDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Specialty { get; set; }
    public required string Contact { get; set; }
}
