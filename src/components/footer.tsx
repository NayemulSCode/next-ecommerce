export function Footer() {
  return (
    <footer className="bg-muted py-6" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 Acme Inc. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
