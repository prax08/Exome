"use client";

import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/Button";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// List of common icons to display in the picker
const commonIcons = [
  "Tag", "Home", "Wallet", "Repeat", "BarChart", "Settings", "PiggyBank",
  "CreditCard", "Banknote", "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign",
  "ShoppingBag", "Utensils", "Car", "Book", "Heart", "Briefcase", "Gift",
  "Coffee", "Plane", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Camera", "Music", "Film", "Zap", "Shield", "Cloud", "Sun", "Moon",
  "Star", "Bell", "Mail", "Phone", "MessageSquare", "Calendar", "MapPin",
  "Globe", "Laptop", "Monitor", "Printer", "HardDrive", "Mouse", "Keyboard",
  "Headphones", "Speaker", "Mic", "Camera", "Video", "Image", "FileText",
  "Folder", "Archive", "Trash", "Edit", "Plus", "Minus", "Check", "X", "Info",
  "AlertTriangle", "HelpCircle", "Search", "Filter", "SortAsc", "SortDesc",
  "User", "Users", "UserPlus", "UserMinus", "UserCheck", "UserX", "Key", "Lock",
  "Unlock", "LogOut", "LogIn", "Settings", "Sliders", "Palette", "Paintbrush",
  "Droplet", "Feather", "PenTool", "Scissors", "Crop", "Move", "ZoomIn", "ZoomOut",
  "RotateCw", "RotateCcw", "RefreshCw", "Upload", "Download", "Share", "Link",
  "ExternalLink", "Copy", "Clipboard", "Save", "SaveAll", "BookOpen", "Bookmark",
  "Hash", "AtSign", "DollarSign", "Euro", "PoundSterling", "IndianRupee", "Yen",
  "Bitcoin", "Wifi", "Bluetooth", "BatteryCharging", "BatteryFull", "BatteryLow",
  "Signal", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock", "Hourglass", "Infinity", "Circle", "Square", "Triangle",
  "Hexagon", "Octagon", "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun",
  "Moon", "Cloud", "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase",
  "Book", "Camera", "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb",
  "Gamepad", "Music", "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet",
  "Home", "Repeat", "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote",
  "Landmark", "TrendingUp", "HandCoins", "CircleDollarSign", "ReceiptText", "Building",
  "Bus", "Train", "Bike", "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer",
  "Wine", "Martini", "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift",
  "ShoppingBag", "ShoppingCart", "Package", "Truck", "Ship", "Plane", "Rocket",
  "Satellite", "Globe", "Map", "Compass", "Navigation", "Target", "Pin", "Anchor",
  "Award", "Trophy", "Crown", "Diamond", "Gem", "Star", "Sparkles", "Zap", "Fire",
  "Droplet", "CloudRain", "CloudSnow", "CloudSun", "CloudLightning", "Wind", "Sunrise",
  "Sunset", "Thermometer", "Umbrella", "Watch", "Clock", "Timer", "AlarmClock",
  "Hourglass", "Infinity", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Star", "Heart", "Flower", "Leaf", "Tree", "Mountain", "Sun", "Moon", "Cloud",
  "Snowflake", "Droplet", "Wind", "Zap", "Fire", "Gift", "Briefcase", "Book", "Camera",
  "Coffee", "Dumbbell", "GraduationCap", "Hospital", "Lightbulb", "Gamepad", "Music",
  "Film", "Plane", "Car", "Utensils", "ShoppingBag", "Tag", "Wallet", "Home", "Repeat",
  "BarChart", "Settings", "PiggyBank", "CreditCard", "Banknote", "Landmark", "TrendingUp",
  "HandCoins", "CircleDollarSign", "ReceiptText", "Building", "Bus", "Train", "Bike",
  "Walk", "Run", "Carrot", "Apple", "Pizza", "Burger", "Beer", "Wine", "Martini",
  "Cake", "Cookie", "IceCream", "Candy", "Popcorn", "Gift", "ShoppingBag", "ShoppingCart",
  "Package", "Truck", "Ship", "Plane", "Rocket", "Satellite", "Globe", "Map", "Compass",
  "Navigation", "Target", "Pin", "Anchor", "Award", "Trophy", "Crown", "Diamond", "Gem",
  "Star", "Sparkles", "Zap", "Fire", "Droplet", "CloudRain", "CloudSnow", "CloudSun",
  "CloudLightning", "Wind", "Sunrise", "Sunset", "Thermometer", "Umbrella", "Watch",
  "Clock", "Timer", "AlarmClock",
];

interface IconPickerProps {
  children: React.ReactNode;
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ children, currentIcon, onSelectIcon }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const allLucideIcons = Object.keys(LucideIcons).filter(
    (name) => typeof (LucideIcons as any)[name] === 'function'
  );

  const filteredIcons = allLucideIcons.filter(iconName =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    onSelectIcon(iconName);
    setOpen(false);
    setSearch(""); // Clear search after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search icons..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup heading="Common Icons">
              {commonIcons.filter(iconName => iconName.toLowerCase().includes(search.toLowerCase())).map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName];
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => handleSelect(iconName)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{iconName}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {search && filteredIcons.length > 0 && (
              <CommandGroup heading="Search Results">
                {filteredIcons.map((iconName) => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => handleSelect(iconName)}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{iconName}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { IconPicker };