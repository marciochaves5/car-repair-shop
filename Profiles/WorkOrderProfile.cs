using AutoMapper;
using Car_Repair_Shop.Data.Dtos.WorkOrderDto;
using Car_Repair_Shop.Models;

namespace Car_Repair_Shop.Profiles;

public class WorkOrderProfile : Profile
{
    public WorkOrderProfile()
    {
        CreateMap<CreateWorkOrderDto, WorkOrder>();
        CreateMap<UpdateWorkOrderDto, WorkOrder>();
        CreateMap<WorkOrder, ReadWorkOrderDto>();
    }
}
