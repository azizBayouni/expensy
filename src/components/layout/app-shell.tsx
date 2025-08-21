
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  ArrowLeftRight,
  LayoutDashboard,
  ListTodo,
  PartyPopper,
  Shapes,
  User,
  Wallet,
  Settings,
  Plane,
  LineChart,
  Target,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTravelMode } from '@/hooks/use-travel-mode';
import { events, top100Currencies } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/transactions',
    label: 'Transactions',
    icon: ArrowLeftRight,
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: LineChart,
  },
  {
    href: '/categories',
    label: 'Categories',
    icon: Shapes,
  },
  {
    href: '/budgets',
    label: 'Budgets',
    icon: Target,
  },
  {
    href: '/debts',
    label: 'Debts',
    icon: ListTodo,
  },
  {
    href: '/wallets',
    label: 'Wallets',
    icon: Wallet,
  },
  {
    href: '/events',
    label: 'Events',
    icon: PartyPopper,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

function TravelModeDialog() {
  const { toast } = useToast();
  const { 
    isActive, 
    eventId, 
    currency, 
    isLoaded,
    activate, 
    deactivate, 
    setEventId, 
    setCurrency 
  } = useTravelMode();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentIsActive, setCurrentIsActive] = React.useState(isActive);
  const [currentEventId, setCurrentEventId] = React.useState(eventId);
  const [currentCurrency, setCurrentCurrency] = React.useState(currency);
  
  React.useEffect(() => {
    if (isLoaded) {
      setCurrentIsActive(isActive);
      setCurrentEventId(eventId);
      setCurrentCurrency(currency);
    }
  }, [isLoaded, isActive, eventId, currency, isOpen]);

  if (!isLoaded) {
    return null; // or a loading skeleton
  }
  
  const handleSave = () => {
    if (currentIsActive) {
      if (!currentEventId || !currentCurrency) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description: 'Please select an event and a currency to activate Travel Mode.',
        });
        return;
      }
      activate(currentEventId, currentCurrency);
      toast({
        title: 'Travel Mode Activated',
        description: `Transactions will now default to the selected event and currency.`,
      });
    } else {
      deactivate();
      toast({
        title: 'Travel Mode Deactivated',
      });
    }
    setIsOpen(false);
  };
  
  const activeEvent = events.find(e => e.id === eventId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("h-7 w-7", isActive && "text-primary ring-2 ring-primary")}>
            <Plane className="size-4" />
            <span className="sr-only">Toggle Travel Mode</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Travel Mode</DialogTitle>
          <DialogDescription>
            Link new transactions to a specific event and currency.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="travel-mode-switch">
                  {currentIsActive ? "Travel Mode is ON" : "Travel Mode is OFF"}
                </Label>
                 <p className="text-xs text-muted-foreground">
                    {currentIsActive && activeEvent ? `Event: ${activeEvent.name} (${currency})` : "All transactions are recorded normally."}
                </p>
              </div>
              <Switch
                id="travel-mode-switch"
                checked={currentIsActive}
                onCheckedChange={setCurrentIsActive}
              />
          </div>

          {currentIsActive && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-select">Event</Label>
                <Select 
                  value={currentEventId || ''} 
                  onValueChange={setCurrentEventId}
                >
                  <SelectTrigger id="event-select">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.filter(e => e.status === 'active').map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.icon} {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency-select">Currency</Label>
                <Select 
                    value={currentCurrency || ''}
                    onValueChange={setCurrentCurrency}
                >
                  <SelectTrigger id="currency-select">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                     {top100Currencies.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <h1 className="text-xl font-semibold">Expensy</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full h-12 gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://placehold.co/40x40" alt="User" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-left truncate">
                  User Name
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User Name</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">
            {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </h2>
          <TravelModeDialog />
        </header>
        <main className="p-4 bg-background/60">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
