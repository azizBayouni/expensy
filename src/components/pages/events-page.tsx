
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PlusCircle,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { events as initialEvents, updateEvents } from '@/lib/data';
import type { Event } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

const eventSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  icon: z.string().min(1, 'Icon is required.'),
  status: z.enum(['active', 'inactive']),
  description: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const eventEmojis: { emoji: string; name: string }[] = [
    { emoji: '✈️', name: 'airplane' }, { emoji: '🎉', name: 'party popper' }, { emoji: '🏨', name: 'hotel' }, { emoji: '🏖️', name: 'beach' },
    { emoji: '⛰️', name: 'mountain' }, { emoji: '🎁', name: 'gift' }, { emoji: '💒', name: 'wedding' }, { emoji: '🎂', name: 'birthday cake' },
    { emoji: '🎄', name: 'christmas tree' }, { emoji: '🎃', name: 'jack-o-lantern' }, { emoji: '🎓', name: 'graduation cap' }, { emoji: '💼', name: 'briefcase' },
    { emoji: '🎵', name: 'musical note' }, { emoji: '🎬', name: 'clapper board' }, { emoji: '🎪', name: 'circus tent' }, { emoji: '🏛️', name: 'classical building' },
    { emoji: '🎭', name: 'performing arts' }, { emoji: '🎤', name: 'microphone' }, { emoji: '🎨', name: 'artist palette' }, { emoji: '🏟️', name: 'stadium' },
    { emoji: '⚽️', name: 'soccer ball' }, { emoji: '🏀', name: 'basketball' }, { emoji: '🎮', name: 'video game' }, { emoji: '🚗', name: 'car' },
    { emoji: '🚲', name: 'bicycle' }, { emoji: '🏃‍♂️', name: 'man running' }, { emoji: '🏞️', name: 'national park' }, { emoji: '🗺️', name: 'map' },
];

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [emojiSearch, setEmojiSearch] = useState('');
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      icon: '🎉',
      status: 'active',
      description: '',
    },
  });

  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    updateEvents(newEvents);
  };

  const openAddDialog = () => {
    setSelectedEvent(null);
    form.reset({
      name: '',
      icon: '🎉',
      status: 'active',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    form.reset({
      name: event.name,
      icon: event.icon,
      status: event.status,
      description: event.description,
    });
    setIsDialogOpen(true);
  };

  const openDeleteAlert = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = (data: EventFormData) => {
    if (selectedEvent) {
      const updatedEvent = { ...selectedEvent, ...data };
      const newEvents = events.map((e) =>
        e.id === selectedEvent.id ? updatedEvent : e
      );
      saveEvents(newEvents);
      toast({ title: 'Success', description: 'Event updated successfully.' });
    } else {
      const newEvent: Event = {
        id: `evt-${Date.now()}`,
        date: format(new Date(), 'yyyy-MM-dd'),
        ...data,
        description: data.description || `${data.name} event`,
      };
      saveEvents([...events, newEvent]);
      toast({ title: 'Success', description: 'Event created successfully.' });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      const newEvents = events.filter((e) => e.id !== eventToDelete.id);
      saveEvents(newEvents);
      toast({ title: 'Success', description: 'Event deleted successfully.' });
      setIsDeleteAlertOpen(false);
      setEventToDelete(null);
    }
  };
  
  const filteredEmojis = eventEmojis.filter(item => 
    item.name.toLowerCase().includes(emojiSearch.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Group your expenses for trips, parties, and other occasions.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link href={`/events/${event.id}`} key={event.id}>
          <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <span className="text-4xl">{event.icon}</span>
                   <div>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                   </div>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={(e) => e.preventDefault()}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); e.preventDefault(); openEditDialog(event); }}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); openDeleteAlert(event); }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-grow mt-auto">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Date: {new Date(event.date).toLocaleDateString()}
                </div>
                 <Badge
                  variant={event.status === 'active' ? 'default' : 'secondary'}
                  className={cn(event.status === 'active' ? 'bg-green-500/80' : 'bg-gray-400')}
                >
                  {event.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? 'Update the details for your event.'
                : 'Create a new event to group expenses.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
               <div className="flex items-start gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                         <Popover>
                          <PopoverTrigger asChild>
                             <FormControl>
                              <Button variant="outline" className="w-20 h-20 text-4xl" style={{fontSize: '2.5rem', lineHeight: '1'}}>
                                {field.value}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 h-64 p-2">
                              <div className="relative mb-2">
                                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                 <Input 
                                   placeholder="Search emoji..."
                                   className="pl-8"
                                   value={emojiSearch}
                                   onChange={(e) => setEmojiSearch(e.target.value)}
                                 />
                              </div>
                            <div className="grid grid-cols-8 gap-1 overflow-y-auto h-[calc(100%-40px)]">
                              {filteredEmojis.map((item) => {
                                return (
                                  <Button
                                    key={item.emoji}
                                    variant="ghost"
                                    className="text-2xl"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      form.setValue("icon", item.emoji, { shouldValidate: true });
                                    }}
                                  >
                                    {item.emoji}
                                  </Button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex-1 space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Europe Trip 2024" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                            <Input placeholder="A short description of the event" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="active" />
                          </FormControl>
                          <FormLabel>Active</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="inactive" />
                          </FormControl>
                          <FormLabel>Inactive</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">
                  {selectedEvent ? 'Save Changes' : 'Create Event'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
