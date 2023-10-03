import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    
    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    }
    catch(error){
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pokemonModel.find()
      .skip(offset)
      .limit(limit)
      .sort({ no: 1 })
      .select('-__v')
  }

  async findOne(id: string) {
    
    let pokemon: Pokemon;

    if ( !isNaN(+id) ) {
      pokemon = await this.pokemonModel.findOne({ no: +id });
    }

    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }

    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase().trim() });
    }

    if ( !pokemon ) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    try{
      const pokemon = await this.findOne(id);

      if ( updatePokemonDto.name ) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }

      await pokemon.updateOne(updatePokemonDto, { new: true } );

      const updatedPokemon = { ...pokemon.toJSON(), ...updatePokemonDto };

      return updatedPokemon;
    }
    catch(error){
      this.handleException(error);
    }    
  }


  async remove(id: string) {

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    
    if ( deletedCount === 0 ) {
      throw new BadRequestException(`Pokemon with ${id} not found`);
    }

    return;
  }

  private handleException(error: any) {
    if ( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create pokemon - Check server logs`);
  }
}
