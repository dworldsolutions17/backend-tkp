import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async seedDefaultAdmin() {
    try {
      // Check if admin already exists
      const adminEmail = 'admin@thekidzplannet.com';
      const defaultPassword = 'admin123';
      const existingAdmin = await this.customerRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        // Always update password to ensure it's correct
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await this.customerRepository.update(existingAdmin.id, {
          role: 'admin',
          password: hashedPassword,
        });
        this.logger.log('✅ Admin user password updated/verified');
        this.logger.log(`📧 Email: ${adminEmail}`);
        this.logger.log(`🔑 Password: ${defaultPassword}`);
        return;
      }

      // Create default admin user
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const admin = this.customerRepository.create({
        name: 'Admin',
        email: adminEmail,
        phone: '+1234567890',
        city: 'Admin City',
        address: 'Admin Address',
        password: hashedPassword,
        role: 'admin',
      });

      await this.customerRepository.save(admin);
      this.logger.log('✅ Default admin user created successfully');
      this.logger.log(`📧 Email: ${adminEmail}`);
      this.logger.log(`🔑 Password: ${defaultPassword}`);
    } catch (error) {
      this.logger.error('Failed to create default admin user', error);
    }
  }
}
