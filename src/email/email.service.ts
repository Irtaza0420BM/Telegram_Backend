import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';  
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.createTransporter();
      this.logger.log('Email transporter successfully initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize email transporter: ${error.message}`, error.stack);
    }
  }

  private async createTransporter() {
    try {
      const clientId = this.configService.get<string>('CLIENT_ID');
      const clientSecret = this.configService.get<string>('CLIENT_SECRET');
      const refreshToken = this.configService.get<string>('REFRESH_TOKEN');
      const emailUser = this.configService.get<string>('EMAIL_USER');
      
      if (!clientId || !clientSecret || !refreshToken || !emailUser) {
        throw new Error('Missing required email configuration. Check your .env file.');
      }

      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground',
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
      
      const accessToken = await oauth2Client.getAccessToken();
      
      if (!accessToken || !accessToken.token) {
        throw new Error('Failed to obtain access token');
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailUser,
          clientId,
          clientSecret,
          refreshToken,
          accessToken: accessToken.token,
        },
      });
      
      await this.transporter.verify();
      
    } catch (error) {
      this.logger.error(`Transporter creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send an email using the configured transporter
   * @param options Email options including to, subject, text, html, etc.
   * @returns Promise with the send result from nodemailer
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: any[];
  }) {
    try {
      if (!this.transporter) {
        this.logger.log('Transporter not initialized, creating now...');
        await this.createTransporter();
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        ...options
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }
}