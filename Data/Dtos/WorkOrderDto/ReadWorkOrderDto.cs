using Car_Repair_Shop.Models;

namespace Car_Repair_Shop.Data.Dtos.WorkOrderDto;

public class ReadWorkOrderDto
{
    public int Id { get; set; }
    public int Number { get; set; }

    public int ClientId { get; set; }
    public int VehicleId { get; set; }
    public int MechanicId { get; set; }

    public required string ProblemDescription { get; set; }
    public required string Service { get; set; }

    public DateTime EntryDate { get; set; }
    public DateTime? DepartureDate { get; set; }

    public decimal Value { get; set; }

    public WorkOrderStatus Status { get; set; }
}
