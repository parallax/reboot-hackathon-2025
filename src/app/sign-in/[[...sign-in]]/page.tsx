import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-accent/5 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-md ml-[6%]">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              card: "shadow-lg border-0 bg-surface/80 backdrop-blur w-full",
              headerTitle: "text-primary-content font-semibold",
              headerSubtitle: "text-secondary-content",
              socialButtonsBlockButton:
                "border-border hover:bg-surface-secondary transition-colors",
              socialButtonsBlockButtonText: "text-primary-content",
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              footerActionLink: "text-primary hover:text-primary/80",
              identityPreviewText: "text-primary-content",
              formFieldInput:
                "border-border focus:border-primary focus:ring-primary/20",
              formFieldLabel: "text-primary-content",
              dividerLine: "bg-border",
              dividerText: "text-muted-content",
            },
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--background))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
              colorDanger: "hsl(var(--destructive))",
              borderRadius: "0.625rem",
            },
          }}
        />
      </div>
    </div>
  );
}
