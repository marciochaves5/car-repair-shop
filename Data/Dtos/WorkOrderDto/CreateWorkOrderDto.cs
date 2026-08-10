namespace Car_Repair_Shop.Data.Dtos.WorkOrderDto;

public class CreateWorkOrderDto
{
    public int Number { get; set; }
    public int ClientId { get; set; }
    public int VehicleId { get; set; }
    public int MechanicId { get; set; }
    public required string ProblemDescription { get; set; }
    public required string Service { get; set; }
    public required DateTime EntryDate { get; set; }
    public DateTime? DepartureDate { get; set; }
}
