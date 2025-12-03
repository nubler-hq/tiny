import type { Prettify } from "@igniter-js/core";
import type { Organization } from "@/@saas-boilerplate/features/organization/organization.interface";
import type { Membership } from "@/@saas-boilerplate/features/membership/membership.interface";
import type { Invitation } from "@/@saas-boilerplate/features/invitation/invitation.interface";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP, organization, twoFactor, mcp } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { AppConfig } from "@/config/boilerplate.config.server";
import { Url } from "@/@saas-boilerplate/utils/url";
import { mail } from "./mail";

export const auth = betterAuth({
  baseURL: Url.get(),
  secret: AppConfig.providers.auth.secret,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    github: {
      clientId: AppConfig.providers.auth.providers.github.clientId,
      clientSecret: AppConfig.providers.auth.providers.github.clientSecret,
    },
    google: {
      clientId: AppConfig.providers.auth.providers.google.clientId,
      clientSecret: AppConfig.providers.auth.providers.google.clientSecret,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  plugins: [
    twoFactor(),
    organization({
      sendInvitationEmail: async ({ email, organization, id }) => {
        await mail.send({
          to: email,
          template: "organization-invite",
          data: {
            email,
            organization: organization.name,
            url: Url.get(`/auth?invitation=${id}`),
          },
        });
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Define subject based on OTP type using object mapping
        const subjectMap = {
          "sign-in": "Your Access Code",
          "email-verification": "Verify Your Email",
          "forget-password": "Password Recovery",
          default: "Verification Code",
        };

        const subject = subjectMap[type] || subjectMap.default;

        console.log({
          to: email,
          subject,
          template: "otp-code",
          data: {
            email,
            otpCode: otp,
            expiresInMinutes: 10, // Default expiration time
          },
        });

        // Send the email with the OTP code
        try {
          await mail.send({
            to: email,
            subject,
            template: "otp-code",
            data: {
              email,
              otpCode: otp,
              expiresInMinutes: 10, // Default expiration time
            },
          });
        } catch (error) {
          console.error("Error sending OTP email:", error);
        }
      },
    }),
    nextCookies()
  ],
});

/**
 * @description The session of the application
 */
export type AuthSession = typeof auth.$Infer.Session;
export type AuthOrganization = Prettify<
  Organization & {
    members: Prettify<
      Membership & {
        user: {
          id: string;
          name: string;
          email: string;
          image?: string | null;
        };
      }
    >[];
    invitations: Invitation[];
  }
>;
