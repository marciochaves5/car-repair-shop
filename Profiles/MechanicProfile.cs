namespace Car_Repair_Shop.Profiles;

using AutoMapper;
using Car_Repair_Shop.Data.Dtos.MechanicDto;
using Car_Repair_Shop.Models;

public class MechanicProfile : Profile
{
    public MechanicProfile()
    {
        CreateMap<CreateMechanicDto, Mechanic>();
        CreateMap<UpdateMechanicDto, Mechanic>();
        CreateMap<Mechanic, ReadMechanicDto>();
    }
}
