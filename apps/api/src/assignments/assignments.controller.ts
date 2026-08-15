import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssignmentEntityType, UserRole } from '@prisma/client';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('assignments')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.STAFF, UserRole.ADMIN)
export class AssignmentsController {
  constructor(private assignments: AssignmentsService) {}

  @Get('player/:playerId')
  findForPlayer(@Param('playerId') playerId: string) {
    return this.assignments.findForPlayer(playerId);
  }

  @Get('current')
  findCurrent(
    @Query('entityType') entityType: AssignmentEntityType,
    @Query('entityId') entityId: string,
  ) {
    return this.assignments.findCurrent(entityType, entityId);
  }

  @Post()
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignments.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignments.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.assignments.remove(id);
  }
}
