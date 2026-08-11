namespace Car_Repair_Shop.Profiles;

using AutoMapper;
using Car_Repair_Shop.Data.Dtos.PieceDto;
using Car_Repair_Shop.Models;

public class PieceProfile : Profile
{
    public PieceProfile()
    {
        CreateMap<CreatePieceDto, Piece>();
        CreateMap<UpdatePieceDto, Piece>();
        CreateMap<Piece, ReadPieceDto>();
    }
}
