import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';
import { SeedModule } from 'src/seed/seed.module';

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [
    MongooseModule.forFeature([
    {
      name: Pokemon.name,
      schema: PokemonSchema,
    }
  ])
  ],
  exports: [MongooseModule]
})
export class PokemonModule {}
