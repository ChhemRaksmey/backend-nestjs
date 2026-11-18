import {
  ConflictException,
  ParseIntPipe,
  Controller,
  Get, Post,
  Render, Res, Body, Param, Query,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../models/customer.entity';
// import { CUSTOMER_ROUTES } from '../routes/customer.routes';
import { CustomersService } from '../services/customers.service';
import { PaginationUtil } from '../utils/pagination.util';


const CUSTOMER_ROUTES = {
  base: '/customers',
  create: '/new',
  edit: '/:id/edit',
  update: '/:id',
  delete: '/:id/delete',
} as const;


@Controller(CUSTOMER_ROUTES.base)
export class CustomersController {
  private readonly pageSize = 10;
  
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Render('customers/index')
  async index(
    @Query('page') pageParam?: string,
  ) {
    const result = await this.customersService.findPage(
      PaginationUtil.parsePage(pageParam),
      this.pageSize,
    );

    return PaginationUtil.withData(result, { title: 'Customers' });
  }

  @Get(CUSTOMER_ROUTES.create)
  @Render('customers/form')
  createForm(): {
    title: string;
    customer: Partial<Customer>;
    formAction: string;
    isEdit: boolean;
  } {
    return {
      title: 'Add customer',
      customer: {},
      formAction: CUSTOMER_ROUTES.base,
      isEdit: false,
    };
  }

  @Post()
  async create(
    @Body() data: CreateCustomerDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.customersService.create(data);
      response.redirect(`${CUSTOMER_ROUTES.base}?notice=created`);
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        throw error;
      }
      this.renderConflict(
        response,
        data,
        'Add customer',
        CUSTOMER_ROUTES.base,
        false,
        error.message,
      );
    }
  }

  @Get(CUSTOMER_ROUTES.edit)
  @Render('customers/form')
  async editForm(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    title: string;
    customer: Customer;
    formAction: string;
    isEdit: boolean;
  }> {
    const customer = await this.customersService.findOne(id);
    return {
      title: 'Edit customer',
      customer,
      formAction: `${CUSTOMER_ROUTES.base}/${customer.id}`,
      isEdit: true,
    };
  }

  @Post(CUSTOMER_ROUTES.update)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCustomerDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.customersService.update(id, data);
      response.redirect(`${CUSTOMER_ROUTES.base}?notice=updated`);
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        throw error;
      }
      this.renderConflict(
        response,
        data,
        'Edit customer',
        `${CUSTOMER_ROUTES.base}/${id}`,
        true,
        error.message,
      );
    }
  }

  @Post(CUSTOMER_ROUTES.delete)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    await this.customersService.remove(id);
    response.redirect(`${CUSTOMER_ROUTES.base}?notice=deleted`);
  }

  private renderConflict(
    response: Response,
    customer: CreateCustomerDto,
    title: string,
    formAction: string,
    isEdit: boolean,
    errorMessage: string,
  ): void {
    response.status(409).render('customers/form', {
      title,
      customer,
      formAction,
      isEdit,
      errorMessage,
    });
  }

}
