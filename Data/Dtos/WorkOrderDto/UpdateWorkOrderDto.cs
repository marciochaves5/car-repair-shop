using Car_Repair_Shop.Models;

namespace Car_Repair_Shop.Data.Dtos.WorkOrderDto;

public class UpdateWorkOrderDto
{
    public required string ProblemDescription { get; set; }
    public required string Service { get; set; }

    public DateTime? DepartureDate { get; set; }

    public decimal Value { get; set; }

    public WorkOrderStatus Status { get; set; }
}
