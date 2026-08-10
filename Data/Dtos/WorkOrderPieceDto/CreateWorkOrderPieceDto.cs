namespace Car_Repair_Shop.Data.Dtos.WorkOrderPieceDto;

public class CreateWorkOrderPieceDto
{
    public int WorkOrderId { get; set; }
    public int PieceId { get; set; }
    public int QuantityUsed { get; set; }
}
