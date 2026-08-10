namespace Car_Repair_Shop.Data.Dtos.VehicleDto;

public class UpdateVehicleDto
{
    public required string Plate { get; set; }
    public required string Model { get; set; }
    public required string Mark { get; set; }
    public int Year { get; set; }
    public required string Color { get; set; }
    public int ClientId { get; set; }
}
