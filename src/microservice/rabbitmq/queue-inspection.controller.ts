// src/rabbitmq/queue-inspection.controller.ts
import {
  Controller,
  Get,
  Delete,
  Query,
  Param,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QueueInspectionService } from './rabbitmq.queue-inspection.service';
import {
  QueueInfoDto,
  MessageContentDto,
  PurgeQueueResponseDto,
} from './dto/queue-inspection.dto';

@ApiTags('queue-inspection')
@Controller('queues')
export class QueueInspectionController {
  private readonly logger = new Logger(QueueInspectionController.name);

  constructor(
    private readonly queueInspectionService: QueueInspectionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get information about a queue' })
  @ApiQuery({
    name: 'queueName',
    required: false,
    description: 'Name of the queue to inspect',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue information retrieved successfully',
    type: QueueInfoDto,
  })
  @ApiResponse({ status: 404, description: 'Queue not found' })
  async getQueueInfo(
    @Query('queueName') queueName?: string,
  ): Promise<QueueInfoDto> {
    try {
      return await this.queueInspectionService.getQueueInfo(queueName);
    } catch (error) {
      this.logger.error(
        `Failed to get queue info: ${error.message}`,
        error.stack,
      );

      if (error.message.includes('NOT_FOUND')) {
        throw new HttpException(
          `Queue ${queueName || 'default'} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        'Failed to get queue information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('messages')
  @ApiOperation({
    summary: 'Peek at messages in a queue without consuming them',
  })
  @ApiQuery({
    name: 'queueName',
    required: false,
    description: 'Name of the queue to inspect',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    description: 'Maximum number of messages to peek',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [MessageContentDto],
  })
  @ApiResponse({ status: 404, description: 'Queue not found' })
  async peekMessages(
    @Query('queueName') queueName?: string,
    @Query('count') count?: number,
  ): Promise<MessageContentDto[]> {
    try {
      return await this.queueInspectionService.peekMessages(
        queueName,
        count ? parseInt(count.toString(), 10) : undefined,
      );
    } catch (error) {
      this.logger.error(
        `Failed to peek messages: ${error.message}`,
        error.stack,
      );

      if (error.message.includes('NOT_FOUND')) {
        throw new HttpException(
          `Queue ${queueName || 'default'} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        'Failed to peek messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Purge all messages from a queue' })
  @ApiQuery({
    name: 'queueName',
    required: false,
    description: 'Name of the queue to purge',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue purged successfully',
    type: PurgeQueueResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Queue not found' })
  async purgeQueue(
    @Query('queueName') queueName?: string,
  ): Promise<PurgeQueueResponseDto> {
    try {
      const purgedCount =
        await this.queueInspectionService.purgeQueue(queueName);

      return {
        success: true,
        purgedCount,
        queueName: queueName || 'main_queue',
      };
    } catch (error) {
      this.logger.error(`Failed to purge queue: ${error.message}`, error.stack);

      if (error.message.includes('NOT_FOUND')) {
        throw new HttpException(
          `Queue ${queueName || 'default'} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        'Failed to purge queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
