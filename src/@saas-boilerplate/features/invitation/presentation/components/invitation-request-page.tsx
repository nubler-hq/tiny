'use client'

import { String } from "@/@saas-boilerplate/utils/string";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { AppConfig } from "@/config/boilerplate.config.client";
import { api } from "@/igniter.client";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { InvitationRequestResponse } from "../../invitation.interface";

export function InvitationRequestPage({
  invitation,
}: {
  invitation: InvitationRequestResponse;
}) {
  const router = useRouter()

  const handleAccept = async () => {
    const toastId = toast.loading("Accepting invitation...");

    const { error } = await api.invitation.accept.mutate({
      params: { id: invitation.id },
    });

    if (error) {
      toast.error("Failed to accept invitation", { id: toastId });
      return;
    }

    toast.success("Invitation accepted!", { id: toastId });
    router.push("/app?welcome=true");
  };

  const handleReject = async () => {
    const toastId = toast.loading("Rejecting invitation...");

    const { error } = await api.invitation.reject.mutate({
      params: { id: invitation.id },
    });

    if (error) {
      toast.error("Failed to reject invitation", { id: toastId });
      return;
    }

    toast.success("Invitation rejected!", { id: toastId });
    router.push("/app");
  };

  return (
    <section className="h-screen flex flex-col items-center justify-between py-16">
      <header>
        <Logo />
      </header>

      <section className="flex flex-col items-center text-center">
        <Avatar className="mb-8">
          <AvatarFallback>
            {String.getInitials(invitation.organizationName || "O")}
          </AvatarFallback>
        </Avatar>

        <h1 className="text-md mb-8 max-w-[80%] leading-7">
          You are invited to join{" "}
          <u className="underline-offset-8 opacity-60">
            {invitation.organizationName}
          </u>{" "}
          by{" "}
          <u className="underline-offset-8 opacity-60">
            {invitation.inviterEmail}
          </u>
        </h1>

        <div className="flex items-center space-x-4">
          <Button type="button" onClick={handleAccept}>
            <CheckIcon />
            Accept
          </Button>

          <Button type="button" variant="ghost" onClick={handleReject}>
            Refuse
          </Button>
        </div>
      </section>

      <footer>
        <p className="text-sm text-muted-foreground">© {AppConfig.name}.</p>
      </footer>
    </section>
  );
}
