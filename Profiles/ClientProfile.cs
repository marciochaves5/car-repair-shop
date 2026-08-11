namespace Car_Repair_Shop.Profiles;

using AutoMapper;
using Car_Repair_Shop.Data.Dtos.ClientDto;
using Car_Repair_Shop.Models;

public class ClientProfile : Profile
{
    public ClientProfile()
    {
        CreateMap<CreateClientDto, Client>();
        CreateMap<UpdateClientDto, Client>();
        CreateMap<Client, ReadClientDto>();
    }
}
