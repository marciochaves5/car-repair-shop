namespace Car_Repair_Shop.Profiles;

using AutoMapper;
using Car_Repair_Shop.Data.Dtos.VehicleDto;
using Car_Repair_Shop.Models;

public class VehicleProfile : Profile
{
    public VehicleProfile()
    {
        CreateMap<CreateVehicleDto, Vehicle>();
        CreateMap<UpdateVehicleDto, Vehicle>();
        CreateMap<Vehicle, ReadVehicleDto>();
    }
}
