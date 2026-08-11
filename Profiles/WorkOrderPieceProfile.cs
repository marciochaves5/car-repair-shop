namespace Car_Repair_Shop.Profiles;

using AutoMapper;
using Car_Repair_Shop.Data.Dtos.WorkOrderPieceDto;
using Car_Repair_Shop.Models;

public class WorkOrderPieceProfile : Profile
{
    public WorkOrderPieceProfile()
    {
        CreateMap<CreateWorkOrderPieceDto, WorkOrderPiece>();
        CreateMap<UpdateWorkOrderPieceDto, WorkOrderPiece>();
        CreateMap<WorkOrderPiece, ReadWorkOrderPieceDto>();   
    }
}
