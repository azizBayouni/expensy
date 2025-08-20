
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type LucideIcon, Smile, Landmark, CreditCard, PiggyBank, Wallet, CircleDollarSign, HelpCircle, Banknote } from "lucide-react";
import * as LucideIcons from 'lucide-react';
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const walletIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'Landmark', icon: Landmark },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'Wallet', icon: Wallet },
  { name: 'CircleDollarSign', icon: CircleDollarSign },
  { name: 'Banknote', icon: Banknote },
];

export function getWalletIcon(iconName?: string): LucideIcon {
    if (!iconName) return HelpCircle;
    const iconItem = walletIcons.find((item) => item.name === iconName);
    return iconItem ? iconItem.icon : HelpCircle;
}

export function getWalletIconName(IconComponent: LucideIcon): string {
    const iconItem = walletIcons.find(item => item.icon === IconComponent);
    return iconItem ? item.name : 'HelpCircle';
}

const expenseEmojis: { emoji: string; name: string }[] = [
    { emoji: '🛒', name: 'shopping cart' }, { emoji: '🍔', name: 'hamburger' }, { emoji: '🍕', name: 'pizza' }, { emoji: '🚗', name: 'car' }, { emoji: '🚌', name: 'bus' },
    { emoji: '✈️', name: 'airplane' }, { emoji: '🏠', name: 'house' }, { emoji: '💡', name: 'light bulb' }, { emoji: '💧', name: 'water drop' }, { emoji: '📱', name: 'mobile phone' },
    { emoji: '💻', name: 'laptop' }, { emoji: '👕', name: 't-shirt' }, { emoji: '👠', name: 'high-heeled shoe' }, { emoji: '💊', name: 'pill' }, { emoji: '🏥', name: 'hospital' },
    { emoji: '🎬', name: 'clapper board' }, { emoji: '🎵', name: 'musical note' }, { emoji: '📚', name: 'books' }, { emoji: '🎓', name: 'graduation cap' }, { emoji: '🎁', name: 'gift' },
    { emoji: '🏨', name: 'hotel' }, { emoji: '🏖️', name: 'beach' }, { emoji: '⛰️', name: 'mountain' }, { emoji: '🎉', name: 'party popper' }, { emoji: '☕️', name: 'coffee' },
    { emoji: '🍹', name: 'tropical drink' }, { emoji: '💅', name: 'nail polish' }, { emoji: '💇‍♀️', name: 'haircut' }, { emoji: '🏋️‍♂️', name: 'weight lifter' }, { emoji: '⚽️', name: 'soccer ball' },
    { emoji: '🏀', name: 'basketball' }, { emoji: '🎮', name: 'video game' }, { emoji: '🐶', name: 'dog' }, { emoji: '🐱', name: 'cat' }, { emoji: '🐾', name: 'paw prints' },
    { emoji: '🥕', name: 'carrot' }, { emoji: '🍎', name: 'apple' }, { emoji: '🥦', name: 'broccoli' }, { emoji: '🍞', name: 'bread' }, { emoji: '🍷', name: 'wine glass' },
    { emoji: '🍺', name: 'beer mug' }, { emoji: '🍸', name: 'cocktail glass' }, { emoji: '🍿', name: 'popcorn' }, { emoji: '🍦', name: 'ice cream' }, { emoji: '🍩', name: 'doughnut' },
    { emoji: '🍪', name: 'cookie' }, { emoji: '🎂', name: 'birthday cake' }, { emoji: '🍓', name: 'strawberry' }, { emoji: '🥑', name: 'avocado' }, { emoji: '🌮', name: 'taco' },
    { emoji: '🍣', name: 'sushi' }, { emoji: '🍜', name: 'ramen' }, { emoji: '🍝', name: 'spaghetti' }, { emoji: '🍟', name: 'french fries' }, { emoji: '🥗', name: 'salad' },
    { emoji: '🥪', name: 'sandwich' }, { emoji: '🥐', name: 'croissant' }, { emoji: '🥨', name: 'pretzel' }, { emoji: '🧀', name: 'cheese' }, { emoji: '🥚', name: 'egg' },
    { emoji: '🥛', name: 'milk' }, { emoji: '🍵', name: 'tea' }, { emoji: '🧃', name: 'juice' }, { emoji: '🥤', name: 'cup with straw' }, { emoji: '🍶', name: 'sake' },
    { emoji: '🥂', name: 'clinking glasses' }, { emoji: '🍻', name: 'clinking beer mugs' }, { emoji: '🥃', name: 'tumbler glass' }, { emoji: '🚧', name: 'construction' }, { emoji: '⛽️', name: 'fuel pump' },
    { emoji: '🚃', name: 'railway car' }, { emoji: '🚇', name: 'metro' }, { emoji: '🚊', name: 'tram' }, { emoji: '🚕', name: 'taxi' }, { emoji: '🚓', name: 'police car' },
    { emoji: '🚑', name: 'ambulance' }, { emoji: '🚚', name: 'delivery truck' }, { emoji: '🚢', name: 'ship' }, { emoji: '🚲', name: 'bicycle' }, { emoji: '🛴', name: 'scooter' },
    { emoji: '🗺️', name: 'map' }, { emoji: '🎫', name: 'ticket' }, { emoji: '🎭', name: 'performing arts' }, { emoji: '🎤', name: 'microphone' }, { emoji: '🎧', name: 'headphone' },
    { emoji: '🎸', name: 'guitar' }, { emoji: '🎹', name: 'musical keyboard' }, { emoji: '🎺', name: 'trumpet' }, { emoji: '🎻', name: 'violin' }, { emoji: '🥁', name: 'drum' },
    { emoji: '🎨', name: 'artist palette' }, { emoji: '🎟️', name: 'admission tickets' }, { emoji: '🎪', name: 'circus tent' }, { emoji: '🏟️', name: 'stadium' }, { emoji: '🏛️', name: 'classical building' },
    { emoji: '🏢', name: 'office building' }, { emoji: '🏬', name: 'department store' }, { emoji: '🏦', name: 'bank' }, { emoji: '🏪', name: 'convenience store' }, { emoji: '🏫', name: 'school' },
    { emoji: '🏭', name: 'factory' }, { emoji: '🏰', name: 'castle' }, { emoji: '💒', name: 'wedding' }, { emoji: '🗼', name: 'Tokyo tower' }, { emoji: '🗽', name: 'Statue of Liberty' },
    { emoji: '🗿', name: 'moai' }, { emoji: '🛠️', name: 'hammer and wrench' }, { emoji: '🔩', name: 'nut and bolt' }, { emoji: '🔨', name: 'hammer' }, { emoji: '🧱', name: 'brick' },
    { emoji: '🪜', name: 'ladder' }, { emoji: '🧹', name: 'broom' }, { emoji: '🧺', name: 'basket' }, { emoji: '🧻', name: 'toilet paper' }, { emoji: '🧼', name: 'soap' },
    { emoji: '🧽', name: 'sponge' }, { emoji: '🛋️', name: 'couch' }, { emoji: '🛏️', name: 'bed' }, { emoji: '🚽', name: 'toilet' }, { emoji: '🚿', name: 'shower' },
    { emoji: '🛁', name: 'bathtub' }, { emoji: '🔌', name: 'electric plug' }, { emoji: '🔋', name: 'battery' }, { emoji: '🖥️', name: 'desktop computer' }, { emoji: '⌨️', name: 'keyboard' },
    { emoji: '🖱️', name: 'computer mouse' }, { emoji: '🖨️', name: 'printer' }, { emoji: '☎️', name: 'telephone' }, { emoji: '📠', name: 'fax machine' }, { emoji: '📺', name: 'television' },
    { emoji: '📷', name: 'camera' }, { emoji: '📹', name: 'video camera' }, { emoji: '⌚️', name: 'watch' }, { emoji: '👚', name: 'womans clothes' }, { emoji: '👖', name: 'jeans' },
    { emoji: '👔', name: 'necktie' }, { emoji: '👗', name: 'dress' }, { emoji: '👙', name: 'bikini' }, { emoji: '👘', name: 'kimono' }, { emoji: '👡', name: 'sandal' },
    { emoji: '👢', name: 'boot' }, { emoji: '👞', name: 'mans shoe' }, { emoji: '👟', name: 'sneaker' }, { emoji: '🧢', name: 'cap' }, { emoji: '👒', name: 'hat' },
    { emoji: '👓', name: 'glasses' }, { emoji: '🕶️', name: 'sunglasses' }, { emoji: '💍', name: 'ring' }, { emoji: '💼', name: 'briefcase' }, { emoji: '👜', name: 'handbag' },
    { emoji: '👝', name: 'pouch' }, { emoji: '👛', name: 'purse' }, { emoji: '🎒', name: 'backpack' }, { emoji: '⛑️', name: 'rescue workers helmet' }, { emoji: '💉', name: 'syringe' },
    { emoji: '🌡️', name: 'thermometer' }, { emoji: '🩺', name: 'stethoscope' }, { emoji: '❤️‍🩹', name: 'mending heart' }, { emoji: '🩹', name: 'adhesive bandage' }, { emoji: '🪥', name: 'toothbrush' },
    { emoji: '💈', name: 'barber pole' }, { emoji: '✂️', name: 'scissors' }, { emoji: '💪', name: 'flexed biceps' }, { emoji: '🧠', name: 'brain' }, { emoji: '👀', name: 'eyes' },
    { emoji: '🦷', name: 'tooth' }, { emoji: '🗣️', name: 'speaking head' }, { emoji: '👨‍⚕️', name: 'man health worker' }, { emoji: '👩‍⚕️', name: 'woman health worker' }, { emoji: '👨‍🎓', name: 'man student' },
    { emoji: '👩‍🎓', name: 'woman student' }, { emoji: '👨‍🏫', name: 'man teacher' }, { emoji: '👩‍🏫', name: 'woman teacher' }, { emoji: '👶', name: 'baby' }, { emoji: '🧒', name: 'child' },
    { emoji: '🧑', name: 'person' }, { emoji: '🧑‍🤝‍🧑', name: 'people holding hands' }, { emoji: '🧑‍💻', name: 'technologist' }, { emoji: '🧑‍🎨', name: 'artist' }, { emoji: '🧑‍🔬', name: 'scientist' },
    { emoji: '🧑‍🚀', name: 'astronaut' }, { emoji: '🧑‍🚒', name: 'firefighter' }, { emoji: '🧑‍✈️', name: 'pilot' }, { emoji: '🧑‍⚖️', name: 'judge' }, { emoji: '👑', name: 'crown' },
    { emoji: '🎩', name: 'top hat' }, { emoji: '💄', name: 'lipstick' }, { emoji: '💎', name: 'gem stone' }, { emoji: '⚽', name: 'soccer' }, { emoji: '⚾', name: 'baseball' },
    { emoji: '🥎', name: 'softball' }, { emoji: '🏐', name: 'volleyball' }, { emoji: '🏈', name: 'american football' }, { emoji: '🏉', name: 'rugby football' }, { emoji: '🎾', name: 'tennis' },
    { emoji: '🎳', name: 'bowling' }, { emoji: '🏏', name: 'cricket game' }, { emoji: '🏑', name: 'field hockey' }, { emoji: '🏒', name: 'ice hockey' }, { emoji: '🥍', name: 'lacrosse' },
    { emoji: '🏓', name: 'ping pong' }, { emoji: '🏸', name: 'badminton' }, { emoji: '🥊', name: 'boxing glove' }, { emoji: '🥋', name: 'martial arts uniform' }, { emoji: '🥅', name: 'goal net' },
    { emoji: '⛳', name: 'golf' }
];

export function getIconComponent(iconName: string | LucideIcon | undefined): LucideIcon {
  if (!iconName) return Smile;
  if (typeof iconName === 'function') return iconName;
  
  if (expenseEmojis.some(e => e.emoji === iconName)) {
    const EmojiComponent = (props: React.ComponentProps<'span'>) => {
      return React.createElement('span', props, iconName);
    };
    EmojiComponent.displayName = 'EmojiComponent';
    return EmojiComponent as unknown as LucideIcon;
  }

  const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon | undefined;
  if (Icon && typeof Icon === 'function') {
    return Icon;
  }

  return Smile;
}
