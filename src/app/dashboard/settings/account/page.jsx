"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function Row({ title, value, actionLabel = "Change", onAction }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground truncate">{value}</div>
      </div>
      <Button variant="link" className="px-0" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile and account information.
        </p>
      </div>

      <Card className="p-4">
        <Row
          title="Display Name"
          value="testa"
          onAction={() => alert("Open modal: change display name")}
        />
        <Separator />

        <Row
          title="Email Address"
          value="ajaspada@gmail.com"
          onAction={() => alert("Open modal: change email")}
        />
        <Separator />

        <Row
          title="Password"
          value="********"
          onAction={() => alert("Open modal: change password")}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-4">
          <div className="font-semibold">Connected Accounts</div>
          <p className="text-sm text-muted-foreground">
            Connect external accounts for sign-in and integrations.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Google</div>
                <div className="text-sm text-muted-foreground">
                  Not connected
                </div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Twitter</div>
                <div className="text-sm text-muted-foreground">
                  Not connected
                </div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>

        {/* <Card className="p-4">
          <div className="font-semibold">Other Settings</div>
          <div className="mt-3 flex flex-col gap-1">
            <Button variant="ghost" className="justify-start">
              Edit Profile
            </Button>
            <Button variant="ghost" className="justify-start">
              Notification Settings
            </Button>
            <Button variant="ghost" className="justify-start">
              Privacy
            </Button>
          </div>
        </Card> */}
      </div>
    </div>
  );
}
