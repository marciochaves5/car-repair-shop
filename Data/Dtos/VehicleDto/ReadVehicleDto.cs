using Car_Repair_Shop.Data.Dtos.ClientDto;
using Car_Repair_Shop.Models;

namespace Car_Repair_Shop.Data.Dtos.VehicleDto;

public class ReadVehicleDto
{
    public int Id { get; set; }
    public required string Plate { get; set; }
    public required string Model { get; set; }
    public required string Mark { get; set; }
    public int Year { get; set; }
    public required string Color { get; set; }
    public int ClientId { get; set; }
    public required ReadClientDto Client { get; set; }
}
