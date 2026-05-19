import { useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { InfoIcon, AlertCircleIcon, CheckCircle2Icon, TriangleAlertIcon, CircleFadingPlusIcon, BluetoothIcon, Trash2Icon, PlusIcon, BadgeCheck, BookmarkIcon, ArrowUpRightIcon, ArrowUpIcon, GitBranchIcon, CircleFadingArrowUpIcon, ChevronDownIcon, SearchIcon, MailIcon, CreditCardIcon, CheckIcon, StarIcon, EyeOffIcon, LogOutIcon, SettingsIcon, UserIcon, BellIcon, MessageSquareIcon, Building2Icon, WalletIcon, PencilIcon, ShareIcon, TrashIcon, MoreHorizontalIcon, AppWindowIcon, CodeIcon, BoldIcon, ItalicIcon, CloudIcon, ShieldAlertIcon, ChevronRightIcon, ExternalLinkIcon, HomeIcon, InboxIcon, CalendarIcon, HelpCircleIcon, SaveIcon, Clock2Icon, UploadIcon, ZapIcon, PackageIcon, BellRingIcon, ThumbsUpIcon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/Components/ui/DataTable'
import { DataTableColumnHeader } from '@/Components/ui/DataTableColumnHeader'
import PublicLayout from '@/Layouts/PublicLayout'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/Components/ui/Accordion'
import {
    Alert,
    AlertTitle,
    AlertDescription,
} from '@/Components/ui/Alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/AlertDialog'
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
    AvatarBadge,
    AvatarGroup,
    AvatarGroupCount,
} from '@/Components/ui/Avatar'
import { Badge } from '@/Components/ui/Badge'
import { Button } from '@/Components/ui/Button'
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from '@/Components/ui/Card'
import { Checkbox } from '@/Components/ui/Checkbox'
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/Components/ui/Collapsible'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from '@/Components/ui/InputGroup'
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxCollection,
    ComboboxSeparator,
    ComboboxChips,
    ComboboxChip,
    ComboboxChipsInput,
    ComboboxValue,
    ComboboxTrigger,
    useComboboxAnchor,
} from '@/Components/ui/Combobox'
import { Input } from '@/Components/ui/Input'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/Dialog'
import { Label } from '@/Components/ui/Label'
import { Separator } from '@/Components/ui/Separator'
import { Slider } from '@/Components/ui/Slider'
import { RadioGroup, RadioGroupItem } from '@/Components/ui/RadioGroup'
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from '@/Components/ui/Field'
import { Textarea } from '@/Components/ui/Textarea'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select'
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from '@/Components/ui/Breadcrumb'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/Components/ui/DropdownMenu'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/Components/ui/NavigationMenu'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/Pagination'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/Components/ui/Popover'
import { Progress } from '@/Components/ui/Progress'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/Components/ui/Sheet'
import { Skeleton } from '@/Components/ui/Skeleton'
import { Spinner } from '@/Components/ui/Spinner'
import { Switch } from '@/Components/ui/Switch'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/Table'
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/Components/ui/Tabs'
import { Toggle } from '@/Components/ui/Toggle'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/Components/ui/Drawer'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/Components/ui/HoverCard'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/Components/ui/InputOTP'
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemHeader,
    ItemMedia,
    ItemTitle,
} from '@/Components/ui/Item'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/Components/ui/Empty'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from '@/Components/ui/Sidebar'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/Tooltip'
import { Calendar, CalendarDayButton } from '@/Components/ui/Calendar'
import { addDays, format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { parseDate } from 'chrono-node'
import { toast } from 'sonner'
const tabs = [
    { id: 'accordion',     label: 'Accordion' },
    { id: 'alert',         label: 'Alert' },
    { id: 'alert-dialog',  label: 'Alert Dialog' },
    { id: 'avatar',        label: 'Avatar' },
    { id: 'badge',         label: 'Badge' },
    { id: 'breadcrumb',    label: 'Breadcrumb' },
    { id: 'button',        label: 'Button' },
    { id: 'card',          label: 'Card' },
    { id: 'checkbox',      label: 'Checkbox' },
    { id: 'collapsible',   label: 'Collapsible' },
    { id: 'combobox',      label: 'Combobox' },
    { id: 'input-group',   label: 'Input Group' },
    { id: 'select',        label: 'Select' },
    { id: 'separator',     label: 'Separator' },
    { id: 'slider',        label: 'Slider' },
    { id: 'radio-group',   label: 'Radio Group' },
    { id: 'field',         label: 'Field' },
    { id: 'dialog',        label: 'Dialog' },
    { id: 'input',         label: 'Input' },
    { id: 'textarea',      label: 'Textarea' },
    { id: 'dropdown-menu',      label: 'Dropdown Menu' },
    { id: 'navigation-menu',    label: 'Navigation Menu' },
    { id: 'pagination',         label: 'Pagination' },
    { id: 'popover',            label: 'Popover' },
    { id: 'progress',           label: 'Progress' },
    { id: 'sheet',              label: 'Sheet' },
    { id: 'skeleton',           label: 'Skeleton' },
    { id: 'spinner',            label: 'Spinner' },
    { id: 'switch',             label: 'Switch' },
    { id: 'table',              label: 'Table' },
    { id: 'tabs',               label: 'Tabs' },
    { id: 'toggle',             label: 'Toggle' },
    { id: 'data-table',         label: 'Data Table' },
    { id: 'drawer',             label: 'Drawer' },
    { id: 'empty',              label: 'Empty' },
    { id: 'hover-card',         label: 'Hover Card' },
    { id: 'input-otp',          label: 'Input OTP' },
    { id: 'item',               label: 'Item' },
    { id: 'sidebar',            label: 'Sidebar' },
    { id: 'tooltip',            label: 'Tooltip' },
    { id: 'calendar',           label: 'Calendar' },
    { id: 'date-picker',        label: 'Date Picker' },
    { id: 'sonner',             label: 'Toast' },
]

export default function ComponentsPreview() {
    const [activeTab, setActiveTab] = useState('accordion')

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-8xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-700 mb-2">Components Preview</h1>
                    <p className="text-sm text-slate-500 mb-8">Verificación de componentes UI</p>

                    <div className="flex gap-2 mb-8 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out ${
                                    activeTab === tab.id
                                        ? 'bg-slate-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-950 hover:text-slate-950'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-10">

                        {activeTab === 'accordion' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Accordion</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-lg">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                                            <AccordionContent>
                                                Click on &apos;Forgot Password&apos; on the login page, enter your email address, and we&apos;ll send you a link to reset your password. The link will expire in 24 hours.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2">
                                            <AccordionTrigger>Can I change my subscription plan?</AccordionTrigger>
                                            <AccordionContent>
                                                Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                                            <AccordionContent>
                                                We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Multiple</p>
                                    <Accordion type="multiple" className="w-full max-w-lg" defaultValue={['notifications']}>
                                        <AccordionItem value="notifications">
                                            <AccordionTrigger>Notification Settings</AccordionTrigger>
                                            <AccordionContent>
                                                Manage how you receive notifications. You can enable email alerts for updates or push notifications for mobile devices.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="privacy">
                                            <AccordionTrigger>Privacy &amp; Security</AccordionTrigger>
                                            <AccordionContent>
                                                Control your privacy settings and security preferences. Enable two-factor authentication, manage connected devices, review active sessions, and configure data sharing preferences.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="billing">
                                            <AccordionTrigger>Billing &amp; Subscription</AccordionTrigger>
                                            <AccordionContent>
                                                View your current plan, payment history, and upcoming invoices. Update your payment method, change your subscription tier, or cancel your subscription.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Disabled</p>
                                    <Accordion type="single" collapsible className="w-full max-w-lg">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>Can I access my account history?</AccordionTrigger>
                                            <AccordionContent>
                                                Yes, you can view your complete account history including all transactions, plan changes, and support tickets in the Account History section of your dashboard.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2" disabled>
                                            <AccordionTrigger>Premium feature information</AccordionTrigger>
                                            <AccordionContent>
                                                This section contains information about premium features. Upgrade your plan to access this content.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>How do I update my email address?</AccordionTrigger>
                                            <AccordionContent>
                                                You can update your email address in your account settings. You&apos;ll receive a verification email at your new address to confirm the change.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Borders</p>
                                    <Accordion type="single" collapsible className="w-full max-w-lg rounded-lg border" defaultValue="billing">
                                        <AccordionItem value="billing" className="border-b px-4 last:border-b-0">
                                            <AccordionTrigger>How does billing work?</AccordionTrigger>
                                            <AccordionContent>
                                                We offer monthly and annual subscription plans. Billing is charged at the beginning of each cycle, and you can cancel anytime.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="security" className="border-b px-4 last:border-b-0">
                                            <AccordionTrigger>Is my data secure?</AccordionTrigger>
                                            <AccordionContent>
                                                Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="integration" className="border-b px-4 last:border-b-0">
                                            <AccordionTrigger>What integrations do you support?</AccordionTrigger>
                                            <AccordionContent>
                                                We integrate with 500+ popular tools including Slack, Zapier, Salesforce, HubSpot, and more.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Card</p>
                                    <Card className="w-full max-w-sm">
                                        <CardHeader>
                                            <CardTitle>Subscription &amp; Billing</CardTitle>
                                            <CardDescription>
                                                Common questions about your account, plans, payments and cancellations.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="single" collapsible defaultValue="plans">
                                                <AccordionItem value="plans">
                                                    <AccordionTrigger>What subscription plans do you offer?</AccordionTrigger>
                                                    <AccordionContent>
                                                        We offer three subscription tiers: Starter, Professional, and Enterprise. Each plan includes increasing storage limits, API access, priority support, and team collaboration features.
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="billing">
                                                    <AccordionTrigger>How does billing work?</AccordionTrigger>
                                                    <AccordionContent>
                                                        Billing occurs automatically at the start of each billing cycle. We accept all major credit cards, PayPal, and ACH transfers for enterprise customers.
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="cancel">
                                                    <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
                                                    <AccordionContent>
                                                        You can cancel your subscription anytime from your account settings. There are no cancellation fees or penalties.
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                </div>

                            </section>
                        )}

                        {activeTab === 'alert' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Alert</h2>

                                <div className="space-y-2">
                                    <p className="text-sm">Default</p>
                                    <Alert>
                                        <CheckCircle2Icon />
                                        <AlertTitle>Account updated successfully</AlertTitle>
                                        <AlertDescription>
                                            Your profile information has been saved. Changes will be reflected immediately.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm">Info</p>
                                    <Alert variant="info">
                                        <InfoIcon />
                                        <AlertTitle>Heads up!</AlertTitle>
                                        <AlertDescription>
                                            You can add components and dependencies to your app using the cli.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm">Success</p>
                                    <Alert variant="success">
                                        <CheckCircle2Icon />
                                        <AlertTitle>Payment confirmed</AlertTitle>
                                        <AlertDescription>
                                            Your order has been placed and will be processed shortly.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm">Warning</p>
                                    <Alert variant="warning">
                                        <TriangleAlertIcon />
                                        <AlertTitle>Low stock</AlertTitle>
                                        <AlertDescription>
                                            Only 3 units remaining. Consider restocking soon.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm">Destructive</p>
                                    <Alert variant="destructive">
                                        <AlertCircleIcon />
                                        <AlertTitle>Payment failed</AlertTitle>
                                        <AlertDescription>
                                            Your payment could not be processed. Please check your payment method and try again.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </section>
                        )}

                        {activeTab === 'alert-dialog' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Alert Dialog</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline">Show Dialog</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your
                                                    account and remove your data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Small</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline">Show Dialog</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent size="sm">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Do you want to allow the USB accessory to connect to this device?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                                                <AlertDialogAction>Allow</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Media</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline">Share Project</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogMedia>
                                                    <CircleFadingPlusIcon />
                                                </AlertDialogMedia>
                                                <AlertDialogTitle>Share this project?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Anyone with the link will be able to view and edit this project.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction>Share</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Small with Media</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline">Show Dialog</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent size="sm">
                                            <AlertDialogHeader>
                                                <AlertDialogMedia>
                                                    <BluetoothIcon />
                                                </AlertDialogMedia>
                                                <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Do you want to allow the USB accessory to connect to this device?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                                                <AlertDialogAction>Allow</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Destructive</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="default" className="bg-red-500 hover:bg-red-700 active:bg-red-800">Delete Chat</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent size="sm">
                                            <AlertDialogHeader>
                                                <AlertDialogMedia className="bg-red-50 text-red-500">
                                                    <Trash2Icon />
                                                </AlertDialogMedia>
                                                <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete this chat conversation. View{' '}
                                                    <a href="#">Settings</a> to delete any memories saved during this chat.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                            </section>
                        )}

                        {activeTab === 'avatar' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Avatar</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="grayscale" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Badge</p>
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                        <AvatarBadge className="bg-emerald-600" />
                                    </Avatar>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Badge with Icon</p>
                                    <Avatar className="grayscale">
                                        <AvatarImage src="https://github.com/pranathip.png" alt="@pranathip" />
                                        <AvatarFallback>PP</AvatarFallback>
                                        <AvatarBadge>
                                            <PlusIcon />
                                        </AvatarBadge>
                                    </Avatar>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Avatar Group</p>
                                    <AvatarGroup className="grayscale">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <Avatar>
                                            <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
                                            <AvatarFallback>LR</AvatarFallback>
                                        </Avatar>
                                        <Avatar>
                                            <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                                            <AvatarFallback>ER</AvatarFallback>
                                        </Avatar>
                                    </AvatarGroup>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Avatar Group Count</p>
                                    <AvatarGroup className="grayscale">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <Avatar>
                                            <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
                                            <AvatarFallback>LR</AvatarFallback>
                                        </Avatar>
                                        <Avatar>
                                            <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                                            <AvatarFallback>ER</AvatarFallback>
                                        </Avatar>
                                        <AvatarGroupCount>+3</AvatarGroupCount>
                                    </AvatarGroup>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Sizes</p>
                                    <div className="flex flex-wrap items-center gap-2 grayscale">
                                        <Avatar size="sm">
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <Avatar size="lg">
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>

                            </section>
                        )}

                        {activeTab === 'badge' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Badge</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Variants</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>Default</Badge>
                                        <Badge variant="secondary">Secondary</Badge>
                                        <Badge variant="destructive">Destructive</Badge>
                                        <Badge variant="outline">Outline</Badge>
                                        <Badge variant="ghost">Ghost</Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">With Icon</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">
                                            <BadgeCheck data-icon="inline-start" />
                                            Verified
                                        </Badge>
                                        <Badge variant="outline">
                                            Bookmark
                                            <BookmarkIcon data-icon="inline-end" />
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Link</p>
                                    <Badge asChild>
                                        <a href="#">
                                            Open Link <ArrowUpRightIcon data-icon="inline-end" />
                                        </a>
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Custom Colors</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-blue-50 text-blue-700">Blue</Badge>
                                        <Badge className="bg-emerald-50 text-emerald-700">Emerald</Badge>
                                        <Badge className="bg-amber-50 text-amber-700">Amber</Badge>
                                        <Badge className="bg-orange-50 text-orange-600">Orange</Badge>
                                        <Badge className="bg-red-50 text-red-700">Red</Badge>
                                    </div>
                                </div>

                            </section>
                        )}

                        {activeTab === 'breadcrumb' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Breadcrumb</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink href="#">Home</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbLink href="#">Components</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Collapsed</p>
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink href="#">Home</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbEllipsis />
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbLink href="#">Components</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>

                            </section>
                        )}

                        {activeTab === 'button' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Button</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Variants</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button>Default</Button>
                                        <Button variant="outline">Outline</Button>
                                        <Button variant="secondary">Secondary</Button>
                                        <Button variant="destructive">Destructive</Button>
                                        <Button variant="ghost">Ghost</Button>
                                        <Button variant="link">Link</Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Sizes</p>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Button size="xs" variant="outline">Extra Small</Button>
                                            <Button size="icon-xs" variant="outline" aria-label="Submit">
                                                <ArrowUpRightIcon />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline">Small</Button>
                                            <Button size="icon-sm" variant="outline" aria-label="Submit">
                                                <ArrowUpRightIcon />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline">Default</Button>
                                            <Button size="icon" variant="outline" aria-label="Submit">
                                                <ArrowUpRightIcon />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Icon</p>
                                    <Button variant="outline" size="icon">
                                        <CircleFadingArrowUpIcon />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">With Icon</p>
                                    <Button variant="outline" size="sm">
                                        <GitBranchIcon /> New Branch
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Rounded</p>
                                    <Button variant="outline" size="icon" className="rounded-full">
                                        <ArrowUpIcon />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">As Child</p>
                                    <Button asChild>
                                        <a href="#">Login</a>
                                    </Button>
                                </div>

                            </section>
                        )}

                        {activeTab === 'card' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Card</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Small</p>
                                    <Card size="sm" className="mx-auto w-full max-w-sm">
                                        <CardHeader>
                                            <CardTitle>Small Card</CardTitle>
                                            <CardDescription>
                                                This card uses the small size variant.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p>
                                                The card component supports a size prop that can be set to
                                                &quot;sm&quot; for a more compact appearance.
                                            </p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="default" size="sm" className="w-full">
                                                Action
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Image</p>
                                    <Card className="relative mx-auto w-full max-w-sm pt-0">
                                        <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                                        <img
                                            src="https://avatar.vercel.sh/shadcn1"
                                            alt="Event cover"
                                            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
                                        />
                                        <CardHeader>
                                            <CardAction>
                                                <Badge variant="secondary">Featured</Badge>
                                            </CardAction>
                                            <CardTitle>Design systems meetup</CardTitle>
                                            <CardDescription>
                                                A practical talk on component APIs, accessibility, and shipping faster.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button className="w-full">View Event</Button>
                                        </CardFooter>
                                    </Card>
                                </div>

                            </section>
                        )}

                        {activeTab === 'checkbox' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Checkbox</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="basic-checkbox" name="basic-checkbox" />
                                        <label htmlFor="basic-checkbox" className="text-sm text-slate-700 cursor-pointer">
                                            Accept terms and conditions
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Description</p>
                                    <div className="flex items-start gap-2">
                                        <Checkbox id="desc-checkbox" name="desc-checkbox" defaultChecked className="mt-0.5" />
                                        <div className="flex flex-col gap-0.5">
                                            <label htmlFor="desc-checkbox" className="text-sm font-medium text-slate-700 cursor-pointer">
                                                Accept terms and conditions
                                            </label>
                                            <p className="text-sm text-slate-500">
                                                By clicking this checkbox, you agree to the terms and conditions.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Disabled</p>
                                    <div className="flex items-center gap-2 opacity-50">
                                        <Checkbox id="disabled-checkbox" name="disabled-checkbox" disabled />
                                        <label htmlFor="disabled-checkbox" className="text-sm text-slate-700 cursor-not-allowed">
                                            Enable notifications
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Invalid</p>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="invalid-checkbox" name="invalid-checkbox" aria-invalid />
                                        <label htmlFor="invalid-checkbox" className="text-sm text-slate-700 cursor-pointer">
                                            Accept terms and conditions
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Group</p>
                                    <fieldset className="flex flex-col gap-3">
                                        <legend className="text-sm font-medium text-slate-700 mb-1">
                                            Show these items on the desktop:
                                        </legend>
                                        <p className="text-sm text-slate-500 -mt-1 mb-1">
                                            Select the items you want to show on the desktop.
                                        </p>
                                        {[
                                            { id: 'hard-disks', label: 'Hard disks', defaultChecked: true },
                                            { id: 'external-disks', label: 'External disks', defaultChecked: true },
                                            { id: 'cds-dvds', label: 'CDs, DVDs, and iPods', defaultChecked: false },
                                            { id: 'connected-servers', label: 'Connected servers', defaultChecked: false },
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`group-${item.id}`}
                                                    name={`group-${item.id}`}
                                                    defaultChecked={item.defaultChecked}
                                                />
                                                <label htmlFor={`group-${item.id}`} className="text-sm text-slate-700 font-normal cursor-pointer">
                                                    {item.label}
                                                </label>
                                            </div>
                                        ))}
                                    </fieldset>
                                </div>

                            </section>
                        )}

                        {activeTab === 'collapsible' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Collapsible</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Card className="mx-auto w-full max-w-sm">
                                        <CardContent>
                                            <Collapsible className="rounded-md data-[state=open]:bg-slate-50">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" className="group w-full">
                                                        Product details
                                                        <ChevronDownIcon className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
                                                    <div>
                                                        This panel can be expanded or collapsed to reveal additional content.
                                                    </div>
                                                    <Button size="xs">Learn More</Button>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </CardContent>
                                    </Card>
                                </div>

                            </section>
                        )}

                        {activeTab === 'input-group' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Input Group</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Icon</p>
                                    <div className="grid w-full max-w-sm gap-6">
                                        <InputGroup>
                                            <InputGroupInput placeholder="Search..." />
                                            <InputGroupAddon>
                                                <SearchIcon />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputGroupInput type="email" placeholder="Enter your email" />
                                            <InputGroupAddon>
                                                <MailIcon />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputGroupInput placeholder="Card number" />
                                            <InputGroupAddon>
                                                <CreditCardIcon />
                                            </InputGroupAddon>
                                            <InputGroupAddon align="inline-end">
                                                <CheckIcon />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputGroupInput placeholder="Card number" />
                                            <InputGroupAddon align="inline-end">
                                                <StarIcon />
                                                <InfoIcon />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputGroupInput type="password" placeholder="Enter password" />
                                            <InputGroupAddon align="inline-end">
                                                <EyeOffIcon />
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Text</p>
                                    <div className="grid w-full max-w-sm gap-6">
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <InputGroupText>$</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput placeholder="0.00" />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupText>USD</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <InputGroupText>https://</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput placeholder="example.com" className="pl-0.5!" />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupText>.com</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputGroupInput placeholder="Enter your username" />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupText>@company.com</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <InputGroup>
                                            <InputGroupTextarea placeholder="Enter your message" />
                                            <InputGroupAddon align="block-end">
                                                <InputGroupText className="text-xs text-slate-500">
                                                    120 characters left
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </div>

                            </section>
                        )}

                        {activeTab === 'dialog' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Dialog</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">Open Dialog</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                                <DialogDescription>
                                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <Button>Continue</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Custom Close Button</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">Share</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Share link</DialogTitle>
                                                <DialogDescription>
                                                    Anyone who has this link will be able to view this.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex items-center gap-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Label htmlFor="share-link" className="sr-only">Link</Label>
                                                    <Input
                                                        id="share-link"
                                                        defaultValue="https://ui.shadcn.com/docs/installation"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter className="sm:justify-start">
                                                <DialogClose asChild>
                                                    <Button type="button">Close</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">No Close Button</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">No Close Button</Button>
                                        </DialogTrigger>
                                        <DialogContent showCloseButton={false}>
                                            <DialogHeader>
                                                <DialogTitle>No Close Button</DialogTitle>
                                                <DialogDescription>
                                                    This dialog doesn&apos;t have a close button in the top-right corner.
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Sticky Footer</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">Sticky Footer</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Sticky Footer</DialogTitle>
                                                <DialogDescription>
                                                    This dialog has a sticky footer that stays visible while the content scrolls.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                {Array.from({ length: 10 }).map((_, index) => (
                                                    <p key={index} className="mb-4 leading-normal">
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                                    </p>
                                                ))}
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Close</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Scrollable Content</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">Scrollable Content</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Scrollable Content</DialogTitle>
                                                <DialogDescription>
                                                    This is a dialog with scrollable content.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                {Array.from({ length: 10 }).map((_, index) => (
                                                    <p key={index} className="mb-4 leading-normal">
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                                    </p>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                            </section>
                        )}

                        {activeTab === 'dropdown-menu' && (
                            <DropdownMenuPreview />
                        )}

                        {activeTab === 'navigation-menu' && (
                            <NavigationMenuPreview />
                        )}

                        {activeTab === 'pagination' && (
                            <PaginationPreview />
                        )}

                        {activeTab === 'popover' && (
                            <PopoverPreview />
                        )}

                        {activeTab === 'progress' && (
                            <ProgressPreview />
                        )}

                        {activeTab === 'sheet' && (
                            <SheetPreview />
                        )}

                        {activeTab === 'skeleton' && (
                            <SkeletonPreview />
                        )}

                        {activeTab === 'spinner' && (
                            <SpinnerPreview />
                        )}

                        {activeTab === 'switch' && (
                            <SwitchPreview />
                        )}

                        {activeTab === 'table' && (
                            <TablePreview />
                        )}

                        {activeTab === 'tabs' && (
                            <TabsPreview />
                        )}

                        {activeTab === 'toggle' && (
                            <TogglePreview />
                        )}

                        {activeTab === 'data-table' && (
                            <DataTablePreview />
                        )}

                        {activeTab === 'drawer' && (
                            <DrawerPreview />
                        )}

                        {activeTab === 'empty' && (
                            <EmptyPreview />
                        )}

                        {activeTab === 'hover-card' && (
                            <HoverCardPreview />
                        )}

                        {activeTab === 'input-otp' && (
                            <InputOTPPreview />
                        )}

                        {activeTab === 'item' && (
                            <ItemPreview />
                        )}

                        {activeTab === 'sidebar' && (
                            <SidebarPreview />
                        )}

                        {activeTab === 'tooltip' && (
                            <TooltipPreview />
                        )}

                        {activeTab === 'calendar' && (
                            <CalendarPreview />
                        )}

                        {activeTab === 'date-picker' && (
                            <DatePickerPreview />
                        )}

                        {activeTab === 'sonner' && (
                            <SonnerPreview />
                        )}

                        {activeTab === 'input' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Input</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Input className="w-full max-w-sm" placeholder="Enter text" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Field</p>
                                    <Field className="w-full max-w-sm">
                                        <FieldLabel htmlFor="in-username">Username</FieldLabel>
                                        <Input id="in-username" type="text" placeholder="Enter your username" />
                                        <FieldDescription>Choose a unique username for your account.</FieldDescription>
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Field Group</p>
                                    <FieldGroup className="w-full max-w-sm">
                                        <Field>
                                            <FieldLabel htmlFor="in-name">Name</FieldLabel>
                                            <Input id="in-name" placeholder="Jordan Lee" />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="in-email">Email</FieldLabel>
                                            <Input id="in-email" type="email" placeholder="name@example.com" />
                                            <FieldDescription>We&apos;ll send updates to this address.</FieldDescription>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <Button type="reset" variant="outline">Reset</Button>
                                            <Button type="submit">Submit</Button>
                                        </Field>
                                    </FieldGroup>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Disabled</p>
                                    <Field className="w-full max-w-sm">
                                        <FieldLabel htmlFor="in-disabled">Email</FieldLabel>
                                        <Input id="in-disabled" type="email" placeholder="Email" disabled />
                                        <FieldDescription>This field is currently disabled.</FieldDescription>
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Invalid</p>
                                    <Field className="w-full max-w-sm">
                                        <FieldLabel htmlFor="in-invalid">Invalid Input</FieldLabel>
                                        <Input id="in-invalid" placeholder="Error" aria-invalid />
                                        <FieldDescription>This field contains validation errors.</FieldDescription>
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">File</p>
                                    <Field className="w-full max-w-sm">
                                        <FieldLabel htmlFor="in-picture">Picture</FieldLabel>
                                        <Input id="in-picture" type="file" />
                                        <FieldDescription>Select a picture to upload.</FieldDescription>
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Inline</p>
                                    <Field orientation="horizontal" className="w-full max-w-sm">
                                        <Input type="search" placeholder="Search..." />
                                        <Button>Search</Button>
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Grid</p>
                                    <FieldGroup className="grid max-w-sm grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="in-first">First Name</FieldLabel>
                                            <Input id="in-first" placeholder="Jordan" />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="in-last">Last Name</FieldLabel>
                                            <Input id="in-last" placeholder="Lee" />
                                        </Field>
                                    </FieldGroup>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Required</p>
                                    <Field className="w-full max-w-sm">
                                        <FieldLabel htmlFor="in-required">
                                            Required Field <span className="text-red-600">*</span>
                                        </FieldLabel>
                                        <Input id="in-required" placeholder="This field is required" required />
                                        <FieldDescription>This field must be filled out.</FieldDescription>
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Badge</p>
                                    <Field className="w-full max-w-sm">
                                        <FieldLabel htmlFor="in-webhook">
                                            Webhook URL{' '}
                                            <Badge variant="secondary" className="ml-auto">Beta</Badge>
                                        </FieldLabel>
                                        <Input id="in-webhook" type="url" placeholder="https://api.example.com/webhook" />
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Input Group</p>
                                    <Field className="w-full max-w-sm">
                                        <FieldLabel htmlFor="in-url">Website URL</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput id="in-url" placeholder="example.com" />
                                            <InputGroupAddon>
                                                <InputGroupText>https://</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupAddon align="inline-end">
                                                <InfoIcon />
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Form</p>
                                    <form className="w-full max-w-sm">
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="form-name">Name</FieldLabel>
                                                <Input id="form-name" type="text" placeholder="Evil Rabbit" required />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="form-email">Email</FieldLabel>
                                                <Input id="form-email" type="email" placeholder="john@example.com" />
                                                <FieldDescription>We&apos;ll never share your email with anyone.</FieldDescription>
                                            </Field>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field>
                                                    <FieldLabel htmlFor="form-phone">Phone</FieldLabel>
                                                    <Input id="form-phone" type="tel" placeholder="+1 (555) 123-4567" />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="form-country">Country</FieldLabel>
                                                    <Select defaultValue="us">
                                                        <SelectTrigger id="form-country">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="us">United States</SelectItem>
                                                            <SelectItem value="uk">United Kingdom</SelectItem>
                                                            <SelectItem value="ca">Canada</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>
                                            <Field>
                                                <FieldLabel htmlFor="form-address">Address</FieldLabel>
                                                <Input id="form-address" type="text" placeholder="123 Main St" />
                                            </Field>
                                            <Field orientation="horizontal">
                                                <Button type="button" variant="outline">Cancel</Button>
                                                <Button type="submit">Submit</Button>
                                            </Field>
                                        </FieldGroup>
                                    </form>
                                </div>

                            </section>
                        )}

                        {activeTab === 'textarea' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Textarea</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Textarea className="w-full max-w-sm" placeholder="Type your message here." />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Disabled</p>
                                    <Textarea className="w-full max-w-sm" placeholder="Type your message here." disabled />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Invalid</p>
                                    <Textarea className="w-full max-w-sm" placeholder="Type your message here." aria-invalid />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Button</p>
                                    <div className="grid w-full max-w-sm gap-2">
                                        <Textarea placeholder="Type your message here." />
                                        <Button>Send message</Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">With Field</p>
                                    <FieldSet className="w-full max-w-sm">
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="ta-feedback">Feedback</FieldLabel>
                                                <Textarea id="ta-feedback" placeholder="Your feedback helps us improve..." rows={4} />
                                                <FieldDescription>Share your thoughts about our service.</FieldDescription>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="ta-invalid">Message (invalid)</FieldLabel>
                                                <Textarea id="ta-invalid" placeholder="Type your message here." aria-invalid />
                                                <FieldDescription>Please enter a valid message.</FieldDescription>
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                </div>

                            </section>
                        )}

                        {activeTab === 'combobox' && (
                            <ComboboxPreview />
                        )}

                        {activeTab === 'select' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Select</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Select defaultValue="banana">
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="Select a fruit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="apple">Apple</SelectItem>
                                                <SelectItem value="banana">Banana</SelectItem>
                                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                                <SelectItem value="grapes">Grapes</SelectItem>
                                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Groups</p>
                                    <Select>
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="Select a fruit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Fruits</SelectLabel>
                                                <SelectItem value="apple">Apple</SelectItem>
                                                <SelectItem value="banana">Banana</SelectItem>
                                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                            </SelectGroup>
                                            <SelectSeparator />
                                            <SelectGroup>
                                                <SelectLabel>Vegetables</SelectLabel>
                                                <SelectItem value="carrot">Carrot</SelectItem>
                                                <SelectItem value="broccoli">Broccoli</SelectItem>
                                                <SelectItem value="spinach">Spinach</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Disabled</p>
                                    <Select disabled>
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="Select a fruit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="apple">Apple</SelectItem>
                                                <SelectItem value="banana">Banana</SelectItem>
                                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                                <SelectItem value="grapes" disabled>Grapes</SelectItem>
                                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Invalid</p>
                                    <Select>
                                        <SelectTrigger className="w-full max-w-48" aria-invalid>
                                            <SelectValue placeholder="Select a fruit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="apple">Apple</SelectItem>
                                                <SelectItem value="banana">Banana</SelectItem>
                                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Invalid with Field</p>
                                    <Field className="w-full max-w-48">
                                        <FieldLabel>Fruit</FieldLabel>
                                        <Select>
                                            <SelectTrigger aria-invalid>
                                                <SelectValue placeholder="Select a fruit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="apple">Apple</SelectItem>
                                                    <SelectItem value="banana">Banana</SelectItem>
                                                    <SelectItem value="blueberry">Blueberry</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>Please select a fruit.</FieldError>
                                    </Field>
                                </div>

                            </section>
                        )}

                        {activeTab === 'separator' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Separator</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Horizontal</p>
                                    <div className="flex flex-col gap-4 text-sm">
                                        <span>Blog</span>
                                        <Separator />
                                        <span>Docs</span>
                                        <Separator />
                                        <span>Source</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Vertical</p>
                                    <div className="flex h-5 items-center gap-4 text-sm">
                                        <div>Blog</div>
                                        <Separator orientation="vertical" />
                                        <div>Docs</div>
                                        <Separator orientation="vertical" />
                                        <div>Source</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Menu</p>
                                    <div className="flex items-center gap-2 text-sm md:gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">Settings</span>
                                            <span className="text-xs text-slate-500">Manage preferences</span>
                                        </div>
                                        <Separator orientation="vertical" />
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">Account</span>
                                            <span className="text-xs text-slate-500">Profile & security</span>
                                        </div>
                                        <Separator orientation="vertical" className="hidden md:block" />
                                        <div className="hidden flex-col gap-1 md:flex">
                                            <span className="font-medium">Help</span>
                                            <span className="text-xs text-slate-500">Support & docs</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">List</p>
                                    <div className="flex w-full max-w-sm flex-col gap-2 text-sm">
                                        <dl className="flex items-center justify-between">
                                            <dt>Item 1</dt>
                                            <dd className="text-slate-500">Value 1</dd>
                                        </dl>
                                        <Separator />
                                        <dl className="flex items-center justify-between">
                                            <dt>Item 2</dt>
                                            <dd className="text-slate-500">Value 2</dd>
                                        </dl>
                                        <Separator />
                                        <dl className="flex items-center justify-between">
                                            <dt>Item 3</dt>
                                            <dd className="text-slate-500">Value 3</dd>
                                        </dl>
                                    </div>
                                </div>

                            </section>
                        )}

                        {activeTab === 'slider' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Slider</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Basic</p>
                                    <Slider defaultValue={[50]} max={100} step={1} className="mx-auto w-full max-w-xs" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Range</p>
                                    <Slider defaultValue={[25, 50]} max={100} step={5} className="mx-auto w-full max-w-xs" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Vertical</p>
                                    <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-6">
                                        <Slider defaultValue={[50]} max={100} step={1} orientation="vertical" className="h-40" />
                                        <Slider defaultValue={[25]} max={100} step={1} orientation="vertical" className="h-40" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Controlled</p>
                                    <SliderControlledPreview />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Disabled</p>
                                    <Slider defaultValue={[50]} max={100} step={1} disabled className="mx-auto w-full max-w-xs" />
                                </div>

                            </section>
                        )}

                        {activeTab === 'radio-group' && (
                            <section className="space-y-8">
                                <h2 className="text-xl font-semibold text-slate-700">Radio Group</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Description</p>
                                    <RadioGroup defaultValue="comfortable" className="w-fit">
                                        <Field orientation="horizontal">
                                            <RadioGroupItem value="default" id="desc-r1" />
                                            <FieldContent>
                                                <FieldLabel htmlFor="desc-r1">Default</FieldLabel>
                                                <FieldDescription>Standard spacing for most use cases.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <RadioGroupItem value="comfortable" id="desc-r2" />
                                            <FieldContent>
                                                <FieldLabel htmlFor="desc-r2">Comfortable</FieldLabel>
                                                <FieldDescription>More space between elements.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <RadioGroupItem value="compact" id="desc-r3" />
                                            <FieldContent>
                                                <FieldLabel htmlFor="desc-r3">Compact</FieldLabel>
                                                <FieldDescription>Minimal spacing for dense layouts.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Choice Card</p>
                                    <RadioGroup defaultValue="plus" className="max-w-sm">
                                        <FieldLabel htmlFor="plus-plan">
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>Plus</FieldTitle>
                                                    <FieldDescription>For individuals and small teams.</FieldDescription>
                                                </FieldContent>
                                                <RadioGroupItem value="plus" id="plus-plan" />
                                            </Field>
                                        </FieldLabel>
                                        <FieldLabel htmlFor="pro-plan">
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>Pro</FieldTitle>
                                                    <FieldDescription>For growing businesses.</FieldDescription>
                                                </FieldContent>
                                                <RadioGroupItem value="pro" id="pro-plan" />
                                            </Field>
                                        </FieldLabel>
                                        <FieldLabel htmlFor="enterprise-plan">
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>Enterprise</FieldTitle>
                                                    <FieldDescription>For large teams and enterprises.</FieldDescription>
                                                </FieldContent>
                                                <RadioGroupItem value="enterprise" id="enterprise-plan" />
                                            </Field>
                                        </FieldLabel>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Fieldset</p>
                                    <FieldSet className="w-full max-w-xs">
                                        <FieldLegend variant="label">Subscription Plan</FieldLegend>
                                        <FieldDescription>Yearly and lifetime plans offer significant savings.</FieldDescription>
                                        <RadioGroup defaultValue="monthly">
                                            <Field orientation="horizontal">
                                                <RadioGroupItem value="monthly" id="plan-monthly" />
                                                <FieldLabel htmlFor="plan-monthly" className="font-normal">Monthly ($9.99/month)</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal">
                                                <RadioGroupItem value="yearly" id="plan-yearly" />
                                                <FieldLabel htmlFor="plan-yearly" className="font-normal">Yearly ($99.99/year)</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal">
                                                <RadioGroupItem value="lifetime" id="plan-lifetime" />
                                                <FieldLabel htmlFor="plan-lifetime" className="font-normal">Lifetime ($299.99)</FieldLabel>
                                            </Field>
                                        </RadioGroup>
                                    </FieldSet>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Disabled</p>
                                    <RadioGroup defaultValue="option2" className="w-fit">
                                        <Field orientation="horizontal" data-disabled="true">
                                            <RadioGroupItem value="option1" id="disabled-r1" disabled />
                                            <FieldLabel htmlFor="disabled-r1" className="font-normal">Disabled</FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <RadioGroupItem value="option2" id="disabled-r2" />
                                            <FieldLabel htmlFor="disabled-r2" className="font-normal">Option 2</FieldLabel>
                                        </Field>
                                        <Field orientation="horizontal">
                                            <RadioGroupItem value="option3" id="disabled-r3" />
                                            <FieldLabel htmlFor="disabled-r3" className="font-normal">Option 3</FieldLabel>
                                        </Field>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500">Invalid</p>
                                    <FieldSet className="w-full max-w-xs">
                                        <FieldLegend variant="label">Notification Preferences</FieldLegend>
                                        <FieldDescription>Choose how you want to receive notifications.</FieldDescription>
                                        <RadioGroup defaultValue="email">
                                            <Field orientation="horizontal" data-invalid="true">
                                                <RadioGroupItem value="email" id="invalid-email" aria-invalid />
                                                <FieldLabel htmlFor="invalid-email" className="font-normal">Email only</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal" data-invalid="true">
                                                <RadioGroupItem value="sms" id="invalid-sms" aria-invalid />
                                                <FieldLabel htmlFor="invalid-sms" className="font-normal">SMS only</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal" data-invalid="true">
                                                <RadioGroupItem value="both" id="invalid-both" aria-invalid />
                                                <FieldLabel htmlFor="invalid-both" className="font-normal">Both Email & SMS</FieldLabel>
                                            </Field>
                                        </RadioGroup>
                                    </FieldSet>
                                </div>

                            </section>
                        )}

                        {activeTab === 'field' && (
                            <FieldPreview />
                        )}

                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}

const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"] as const

const timezones = [
    {
        value: "Americas",
        items: ["(GMT-5) New York", "(GMT-8) Los Angeles", "(GMT-6) Chicago", "(GMT-3) São Paulo"],
    },
    {
        value: "Europe",
        items: ["(GMT+0) London", "(GMT+1) Paris", "(GMT+1) Berlin", "(GMT+1) Madrid"],
    },
    {
        value: "Asia/Pacific",
        items: ["(GMT+9) Tokyo", "(GMT+8) Shanghai", "(GMT+8) Singapore", "(GMT+11) Sydney"],
    },
] as const

const countries = [
    { code: "ar", value: "argentina",      label: "Argentina",      continent: "South America" },
    { code: "au", value: "australia",      label: "Australia",      continent: "Oceania" },
    { code: "br", value: "brazil",         label: "Brazil",         continent: "South America" },
    { code: "ca", value: "canada",         label: "Canada",         continent: "North America" },
    { code: "cn", value: "china",          label: "China",          continent: "Asia" },
    { code: "fr", value: "france",         label: "France",         continent: "Europe" },
    { code: "de", value: "germany",        label: "Germany",        continent: "Europe" },
    { code: "jp", value: "japan",          label: "Japan",          continent: "Asia" },
    { code: "mx", value: "mexico",         label: "Mexico",         continent: "North America" },
    { code: "us", value: "united-states",  label: "United States",  continent: "North America" },
] as const

function PaginationPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Pagination</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Con elipsis</p>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">4</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>5</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">6</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">10</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Solo iconos</p>
                <div className="flex items-center justify-between gap-4 w-full max-w-sm">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="pag-rows-per-page">Rows per page</FieldLabel>
                        <Select defaultValue="25">
                            <SelectTrigger className="w-20" id="pag-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

        </section>
    )
}

function NavigationMenuPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Navigation Menu</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Con dropdown</p>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Productos</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-1 md:w-64">
                                    <li>
                                        <NavigationMenuLink href="#">
                                            <span className="text-sm font-medium">LinkiuHooks</span>
                                            <span className="text-xs text-slate-500">Automatizaciones y webhooks</span>
                                        </NavigationMenuLink>
                                    </li>
                                    <li>
                                        <NavigationMenuLink href="#">
                                            <span className="text-sm font-medium">LinkiuBuild</span>
                                            <span className="text-xs text-slate-500">Constructor de páginas</span>
                                        </NavigationMenuLink>
                                    </li>
                                    <li>
                                        <NavigationMenuLink href="#">
                                            <span className="text-sm font-medium">Analytics</span>
                                            <span className="text-xs text-slate-500">Mapas de calor y grabaciones</span>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-1 md:w-48">
                                    <li>
                                        <NavigationMenuLink href="#">
                                            <span className="text-sm font-medium">Documentación</span>
                                        </NavigationMenuLink>
                                    </li>
                                    <li>
                                        <NavigationMenuLink href="#">
                                            <span className="text-sm font-medium">Blog</span>
                                        </NavigationMenuLink>
                                    </li>
                                    <li>
                                        <NavigationMenuLink href="#">
                                            <span className="text-sm font-medium">Soporte</span>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                                Precios
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Solo links</p>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#" data-active="true">
                                Inicio
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                                Tienda
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                                Nosotros
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                                Contacto
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sin viewport (popover)</p>
                <NavigationMenu viewport={false}>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Cuenta</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-1 w-40">
                                    <li><NavigationMenuLink href="#">Perfil</NavigationMenuLink></li>
                                    <li><NavigationMenuLink href="#">Facturación</NavigationMenuLink></li>
                                    <li><NavigationMenuLink href="#">Configuración</NavigationMenuLink></li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Equipo</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-1 w-40">
                                    <li><NavigationMenuLink href="#">Miembros</NavigationMenuLink></li>
                                    <li><NavigationMenuLink href="#">Permisos</NavigationMenuLink></li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

        </section>
    )
}

function DropdownMenuCheckboxesPreview() {
    const [showStatusBar, setShowStatusBar] = useState(true)
    const [showActivityBar, setShowActivityBar] = useState(false)
    const [showPanel, setShowPanel] = useState(false)
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Open</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem checked={showStatusBar ?? false} onCheckedChange={setShowStatusBar}>
                        Status Bar
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar} disabled>
                        Activity Bar
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
                        Panel
                    </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DropdownMenuCheckboxesIconsPreview() {
    const [notifications, setNotifications] = useState({ email: true, sms: false, push: true })
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Notifications</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Notification Preferences</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked === true })}
                    >
                        <MailIcon />
                        Email notifications
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked === true })}
                    >
                        <MessageSquareIcon />
                        SMS notifications
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked === true })}
                    >
                        <BellIcon />
                        Push notifications
                    </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DropdownMenuRadioGroupPreview() {
    const [position, setPosition] = useState("bottom")
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Open</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                        <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DropdownMenuRadioIconsPreview() {
    const [paymentMethod, setPaymentMethod] = useState("card")
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Payment Method</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Select Payment Method</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <DropdownMenuRadioItem value="card">
                            <CreditCardIcon />
                            Credit Card
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="paypal">
                            <WalletIcon />
                            PayPal
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="bank">
                            <Building2Icon />
                            Bank Transfer
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DropdownMenuPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Dropdown Menu</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>GitHub</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuItem disabled>API</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Submenu</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem>Email</DropdownMenuItem>
                                        <DropdownMenuItem>Message</DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem>Calendly</DropdownMenuItem>
                                                    <DropdownMenuItem>Slack</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>Webhook</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Advanced...</DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem>
                                New Team
                                <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Icons</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <UserIcon />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCardIcon />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <SettingsIcon />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                            <LogOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Checkboxes</p>
                <DropdownMenuCheckboxesPreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Checkboxes Icons</p>
                <DropdownMenuCheckboxesIconsPreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Radio Group</p>
                <DropdownMenuRadioGroupPreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Radio Icons</p>
                <DropdownMenuRadioIconsPreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Destructive</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <PencilIcon />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <ShareIcon />
                                Share
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem variant="destructive">
                                <TrashIcon />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </section>
    )
}

function SliderControlledPreview() {
    const [value, setValue] = useState([0.3, 0.7])
    return (
        <div className="mx-auto grid w-full max-w-xs gap-3">
            <div className="flex items-center justify-between gap-2">
                <Label htmlFor="slider-temperature">Temperature</Label>
                <span className="text-sm text-slate-500">{value.join(', ')}</span>
            </div>
            <Slider
                id="slider-temperature"
                value={value}
                onValueChange={(v) => setValue(v)}
                min={0}
                max={1}
                step={0.1}
            />
        </div>
    )
}

function FieldSliderPreview() {
    const [value, setValue] = useState<number[]>([200, 800])
    return (
        <Field className="w-full max-w-xs">
            <FieldTitle>Price Range</FieldTitle>
            <FieldDescription>
                Set your budget range ($<span className="font-medium tabular-nums">{value[0]}</span> – $<span className="font-medium tabular-nums">{value[1]}</span>).
            </FieldDescription>
            <Slider
                value={value}
                onValueChange={(v) => setValue(v)}
                max={1000}
                min={0}
                step={10}
                className="mt-2 w-full"
                aria-label="Price Range"
            />
        </Field>
    )
}

function FieldPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Field</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Input</p>
                <FieldSet className="w-full max-w-xs">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="f-username">Username</FieldLabel>
                            <Input id="f-username" type="text" placeholder="Max Leiter" />
                            <FieldDescription>Choose a unique username for your account.</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="f-password">Password</FieldLabel>
                            <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                            <Input id="f-password" type="password" placeholder="••••••••" />
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Textarea</p>
                <FieldSet className="w-full max-w-xs">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="f-feedback">Feedback</FieldLabel>
                            <Textarea id="f-feedback" placeholder="Your feedback helps us improve..." rows={4} />
                            <FieldDescription>Share your thoughts about our service.</FieldDescription>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Select</p>
                <Field className="w-full max-w-xs">
                    <FieldLabel>Department</FieldLabel>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="support">Customer Support</SelectItem>
                                <SelectItem value="hr">Human Resources</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="operations">Operations</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <FieldDescription>Select your department or area of work.</FieldDescription>
                </Field>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Slider</p>
                <FieldSliderPreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Fieldset</p>
                <FieldSet className="w-full max-w-sm">
                    <FieldLegend>Address Information</FieldLegend>
                    <FieldDescription>We need your address to deliver your order.</FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="f-street">Street Address</FieldLabel>
                            <Input id="f-street" type="text" placeholder="123 Main St" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="f-city">City</FieldLabel>
                                <Input id="f-city" type="text" placeholder="New York" />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="f-zip">Postal Code</FieldLabel>
                                <Input id="f-zip" type="text" placeholder="90502" />
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Checkbox</p>
                <FieldGroup className="w-full max-w-xs">
                    <FieldSet>
                        <FieldLegend variant="label">Show these items on the desktop</FieldLegend>
                        <FieldDescription>Select the items you want to show on the desktop.</FieldDescription>
                        <FieldGroup className="gap-3">
                            <Field orientation="horizontal">
                                <Checkbox id="fp-hard-disks" defaultChecked />
                                <FieldLabel htmlFor="fp-hard-disks" className="font-normal">Hard disks</FieldLabel>
                            </Field>
                            <Field orientation="horizontal">
                                <Checkbox id="fp-external-disks" defaultChecked />
                                <FieldLabel htmlFor="fp-external-disks" className="font-normal">External disks</FieldLabel>
                            </Field>
                            <Field orientation="horizontal">
                                <Checkbox id="fp-cds" />
                                <FieldLabel htmlFor="fp-cds" className="font-normal">CDs, DVDs, and iPods</FieldLabel>
                            </Field>
                            <Field orientation="horizontal">
                                <Checkbox id="fp-servers" />
                                <FieldLabel htmlFor="fp-servers" className="font-normal">Connected servers</FieldLabel>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator />
                    <Field orientation="horizontal">
                        <Checkbox id="fp-sync" defaultChecked />
                        <FieldContent>
                            <FieldLabel htmlFor="fp-sync">Sync Desktop & Documents folders</FieldLabel>
                            <FieldDescription>Your Desktop & Documents folders are being synced with iCloud Drive. You can access them from other devices.</FieldDescription>
                        </FieldContent>
                    </Field>
                </FieldGroup>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Radio</p>
                <FieldSet className="w-full max-w-xs">
                    <FieldLegend variant="label">Subscription Plan</FieldLegend>
                    <FieldDescription>Yearly and lifetime plans offer significant savings.</FieldDescription>
                    <RadioGroup defaultValue="monthly">
                        <Field orientation="horizontal">
                            <RadioGroupItem value="monthly" id="f-plan-monthly" />
                            <FieldLabel htmlFor="f-plan-monthly" className="font-normal">Monthly ($9.99/month)</FieldLabel>
                        </Field>
                        <Field orientation="horizontal">
                            <RadioGroupItem value="yearly" id="f-plan-yearly" />
                            <FieldLabel htmlFor="f-plan-yearly" className="font-normal">Yearly ($99.99/year)</FieldLabel>
                        </Field>
                        <Field orientation="horizontal">
                            <RadioGroupItem value="lifetime" id="f-plan-lifetime" />
                            <FieldLabel htmlFor="f-plan-lifetime" className="font-normal">Lifetime ($299.99)</FieldLabel>
                        </Field>
                    </RadioGroup>
                </FieldSet>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Field Group</p>
                <FieldGroup className="w-full max-w-xs">
                    <FieldSet>
                        <FieldLabel>Responses</FieldLabel>
                        <FieldDescription>Get notified when ChatGPT responds to requests that take time, like research or image generation.</FieldDescription>
                        <FieldGroup data-slot="checkbox-group">
                            <Field orientation="horizontal">
                                <Checkbox id="fp-push" defaultChecked disabled />
                                <FieldLabel htmlFor="fp-push" className="font-normal">Push notifications</FieldLabel>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator />
                    <FieldSet>
                        <FieldLabel>Tasks</FieldLabel>
                        <FieldDescription>Get notified when tasks you&apos;ve created have updates. <a href="#">Manage tasks</a></FieldDescription>
                        <FieldGroup data-slot="checkbox-group">
                            <Field orientation="horizontal">
                                <Checkbox id="fp-push-tasks" />
                                <FieldLabel htmlFor="fp-push-tasks" className="font-normal">Push notifications</FieldLabel>
                            </Field>
                            <Field orientation="horizontal">
                                <Checkbox id="fp-email-tasks" />
                                <FieldLabel htmlFor="fp-email-tasks" className="font-normal">Email notifications</FieldLabel>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>
            </div>

        </section>
    )
}

function ComboboxMultiplePreview() {
    const anchor = useComboboxAnchor()
    return (
        <Combobox multiple autoHighlight items={frameworks} defaultValue={[frameworks[0]]}>
            <ComboboxChips ref={anchor} className="w-full max-w-xs">
                <ComboboxValue>
                    {(values: string[]) => (
                        <>
                            {values.map((value) => (
                                <ComboboxChip key={value}>{value}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput />
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                    {(item: string) => (
                        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}

function ComboboxPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Combobox</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <div className="w-full max-w-xs">
                    <Combobox items={frameworks}>
                        <ComboboxInput placeholder="Select a framework" />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item: string) => (
                                    <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Multiple</p>
                <ComboboxMultiplePreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Clear Button</p>
                <div className="w-full max-w-xs">
                    <Combobox items={frameworks} defaultValue={frameworks[0]}>
                        <ComboboxInput placeholder="Select a framework" showClear />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item: string) => (
                                    <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Groups</p>
                <div className="w-full max-w-xs">
                    <Combobox items={timezones}>
                        <ComboboxInput placeholder="Select a timezone" />
                        <ComboboxContent>
                            <ComboboxEmpty>No timezones found.</ComboboxEmpty>
                            <ComboboxList>
                                {(group: typeof timezones[number], index: number) => (
                                    <ComboboxGroup key={group.value} items={group.items}>
                                        <ComboboxLabel>{group.value}</ComboboxLabel>
                                        <ComboboxCollection>
                                            {(item: string) => (
                                                <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                            )}
                                        </ComboboxCollection>
                                        {index < timezones.length - 1 && <ComboboxSeparator />}
                                    </ComboboxGroup>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Invalid</p>
                <div className="w-full max-w-xs">
                    <Combobox items={frameworks}>
                        <ComboboxInput placeholder="Select a framework" aria-invalid="true" />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item: string) => (
                                    <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Disabled</p>
                <div className="w-full max-w-xs">
                    <Combobox items={frameworks}>
                        <ComboboxInput placeholder="Select a framework" disabled />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item: string) => (
                                    <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Auto Highlight</p>
                <div className="w-full max-w-xs">
                    <Combobox items={frameworks} autoHighlight>
                        <ComboboxInput placeholder="Select a framework" />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item: string) => (
                                    <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Popup</p>
                <Combobox items={countries} defaultValue={countries[0]}>
                    <ComboboxTrigger
                        render={
                            <Button variant="outline" className="w-64 justify-between font-normal">
                                <ComboboxValue />
                            </Button>
                        }
                    />
                    <ComboboxContent>
                        <ComboboxInput showTrigger={false} placeholder="Search" />
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item: typeof countries[number]) => (
                                <ComboboxItem key={item.code} value={item}>
                                    {item.label}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>

        </section>
    )
}

function PopoverPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Popover</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                        <PopoverHeader>
                            <PopoverTitle>Dimensions</PopoverTitle>
                            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
                        </PopoverHeader>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Align</p>
                <div className="flex gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">Start</Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-40">
                            Aligned to start
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">Center</Button>
                        </PopoverTrigger>
                        <PopoverContent align="center" className="w-40">
                            Aligned to center
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">End</Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-40">
                            Aligned to end
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With form</p>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64" align="start">
                        <PopoverHeader>
                            <PopoverTitle>Dimensions</PopoverTitle>
                            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
                        </PopoverHeader>
                        <FieldGroup className="gap-4">
                            <Field orientation="horizontal">
                                <FieldLabel htmlFor="pop-width" className="w-1/2">Width</FieldLabel>
                                <Input id="pop-width" defaultValue="100%" />
                            </Field>
                            <Field orientation="horizontal">
                                <FieldLabel htmlFor="pop-height" className="w-1/2">Height</FieldLabel>
                                <Input id="pop-height" defaultValue="25px" />
                            </Field>
                        </FieldGroup>
                    </PopoverContent>
                </Popover>
            </div>

        </section>
    )
}

function ProgressControlled() {
    const [value, setValue] = useState([50])
    return (
        <div className="flex w-full max-w-sm flex-col gap-4">
            <Progress value={value[0]} />
            <Slider
                value={value}
                onValueChange={setValue}
                min={0}
                max={100}
                step={1}
            />
        </div>
    )
}

function ProgressPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Progress</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <Progress value={60} className="w-full max-w-sm" />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sizes</p>
                <div className="flex w-full max-w-sm flex-col gap-3">
                    <Progress value={40} className="h-1" />
                    <Progress value={60} className="h-1.5" />
                    <Progress value={80} className="h-2" />
                    <Progress value={100} className="h-3" />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With label</p>
                <Field className="w-full max-w-sm">
                    <FieldLabel htmlFor="progress-upload">
                        <span>Upload progress</span>
                        <span className="ml-auto">66%</span>
                    </FieldLabel>
                    <Progress value={66} id="progress-upload" />
                </Field>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Controlled</p>
                <ProgressControlled />
            </div>

        </section>
    )
}

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const

function SheetPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Sheet</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sides</p>
                <div className="flex flex-wrap gap-2">
                    {SHEET_SIDES.map((side) => (
                        <Sheet key={side}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="capitalize">{side}</Button>
                            </SheetTrigger>
                            <SheetContent
                                side={side}
                                className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
                            >
                                <SheetHeader>
                                    <SheetTitle>Edit profile</SheetTitle>
                                    <SheetDescription>
                                        Make changes to your profile here. Click save when you're done.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="overflow-y-auto px-4">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <p key={index} className="mb-2 leading-relaxed text-slate-600">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                                        </p>
                                    ))}
                                </div>
                                <SheetFooter>
                                    <Button type="submit">Save changes</Button>
                                    <SheetClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">No close button</p>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline">Open Sheet</Button>
                    </SheetTrigger>
                    <SheetContent showCloseButton={false}>
                        <SheetHeader>
                            <SheetTitle>No Close Button</SheetTitle>
                            <SheetDescription>
                                This sheet doesn't have a close button. Click outside to close.
                            </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>

        </section>
    )
}

function SkeletonPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Skeleton</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Avatar</p>
                <div className="flex w-fit items-center gap-4">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="grid gap-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Card</p>
                <Card className="w-full max-w-xs">
                    <CardHeader>
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="aspect-video w-full" />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Text</p>
                <div className="flex w-full max-w-xs flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Form</p>
                <div className="flex w-full max-w-xs flex-col gap-7">
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Table</p>
                <div className="flex w-full max-w-sm flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div className="flex gap-4" key={index}>
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>

        </section>
    )
}

function SpinnerPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Spinner</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sizes</p>
                <div className="flex items-center gap-6">
                    <Spinner className="size-3" />
                    <Spinner className="size-4" />
                    <Spinner className="size-6" />
                    <Spinner className="size-8" />
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Button</p>
                <div className="flex flex-wrap items-center gap-4">
                    <Button disabled size="sm">
                        <Spinner data-icon="inline-start" />
                        Loading...
                    </Button>
                    <Button variant="outline" disabled size="sm">
                        <Spinner data-icon="inline-start" />
                        Please wait
                    </Button>
                    <Button variant="secondary" disabled size="sm">
                        <Spinner data-icon="inline-start" />
                        Processing
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Badge</p>
                <div className="flex flex-wrap items-center gap-4">
                    <Badge>
                        <Spinner data-icon="inline-start" />
                        Syncing
                    </Badge>
                    <Badge variant="secondary">
                        <Spinner data-icon="inline-start" />
                        Updating
                    </Badge>
                    <Badge variant="outline">
                        <Spinner data-icon="inline-start" />
                        Processing
                    </Badge>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Input Group</p>
                <div className="flex w-full max-w-md flex-col gap-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Send a message..." disabled />
                        <InputGroupAddon align="inline-end">
                            <Spinner />
                        </InputGroupAddon>
                    </InputGroup>
                    <InputGroup>
                        <InputGroupTextarea placeholder="Send a message..." disabled />
                        <InputGroupAddon align="block-end">
                            <Spinner /> Validating...
                            <InputGroupButton className="ml-auto" variant="default">
                                <ArrowUpIcon />
                                <span className="sr-only">Send</span>
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>

        </section>
    )
}

function SwitchPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Switch</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <div className="flex items-center gap-2">
                    <Switch id="switch-basic" />
                    <Label htmlFor="switch-basic">Airplane mode</Label>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sizes</p>
                <FieldGroup className="w-full max-w-[10rem]">
                    <Field orientation="horizontal">
                        <Switch id="switch-size-sm" size="sm" />
                        <FieldLabel htmlFor="switch-size-sm">Small</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                        <Switch id="switch-size-default" size="default" />
                        <FieldLabel htmlFor="switch-size-default">Default</FieldLabel>
                    </Field>
                </FieldGroup>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With description</p>
                <Field orientation="horizontal" className="max-w-sm">
                    <FieldContent>
                        <FieldLabel htmlFor="switch-description">Share across devices</FieldLabel>
                        <FieldDescription>
                            Focus is shared across devices, and turns off when you leave the app.
                        </FieldDescription>
                    </FieldContent>
                    <Switch id="switch-description" />
                </Field>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Choice card</p>
                <FieldGroup className="w-full max-w-sm">
                    <FieldLabel htmlFor="switch-share">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Share across devices</FieldTitle>
                                <FieldDescription>
                                    Focus is shared across devices, and turns off when you leave the app.
                                </FieldDescription>
                            </FieldContent>
                            <Switch id="switch-share" />
                        </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="switch-notifications">
                        <Field orientation="horizontal">
                            <FieldContent>
                                <FieldTitle>Enable notifications</FieldTitle>
                                <FieldDescription>
                                    Receive notifications when focus mode is enabled or disabled.
                                </FieldDescription>
                            </FieldContent>
                            <Switch id="switch-notifications" defaultChecked />
                        </Field>
                    </FieldLabel>
                </FieldGroup>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Disabled</p>
                <Field orientation="horizontal" data-disabled className="w-fit">
                    <Switch id="switch-disabled" disabled />
                    <FieldLabel htmlFor="switch-disabled">Disabled</FieldLabel>
                </Field>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Invalid</p>
                <Field orientation="horizontal" className="max-w-sm" data-invalid>
                    <FieldContent>
                        <FieldLabel htmlFor="switch-invalid">Accept terms and conditions</FieldLabel>
                        <FieldDescription>
                            You must accept the terms and conditions to continue.
                        </FieldDescription>
                    </FieldContent>
                    <Switch id="switch-invalid" aria-invalid />
                </Field>
            </div>

        </section>
    )
}

const invoices = [
    { invoice: "INV001", paymentStatus: "Paid",    totalAmount: "$250.00", paymentMethod: "Credit Card"   },
    { invoice: "INV002", paymentStatus: "Pending",  totalAmount: "$150.00", paymentMethod: "PayPal"        },
    { invoice: "INV003", paymentStatus: "Unpaid",   totalAmount: "$350.00", paymentMethod: "Bank Transfer" },
    { invoice: "INV004", paymentStatus: "Paid",    totalAmount: "$450.00", paymentMethod: "Credit Card"   },
    { invoice: "INV005", paymentStatus: "Paid",    totalAmount: "$550.00", paymentMethod: "PayPal"        },
]

function TablePreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Table</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic with footer</p>
                <Table>
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.invoice}>
                                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                <TableCell>{invoice.paymentStatus}</TableCell>
                                <TableCell>{invoice.paymentMethod}</TableCell>
                                <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3}>Total</TableCell>
                            <TableCell className="text-right">$1,750.00</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With actions</p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[
                            { name: "Wireless Mouse",     price: "$29.99"  },
                            { name: "Mechanical Keyboard", price: "$129.99" },
                            { name: "USB-C Hub",           price: "$49.99"  },
                        ].map((product) => (
                            <TableRow key={product.name}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.price}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8">
                                                <MoreHorizontalIcon />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

        </section>
    )
}

function TabsPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Tabs</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Default</p>
                <Tabs defaultValue="account" className="w-full max-w-lg">
                    <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700">
                            Account settings content
                        </div>
                    </TabsContent>
                    <TabsContent value="password">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700">
                            Password settings content
                        </div>
                    </TabsContent>
                    <TabsContent value="settings">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700">
                            General settings content
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Line</p>
                <Tabs defaultValue="overview" className="w-full max-w-lg">
                    <TabsList variant="line">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <div className="pt-3 text-slate-700 text-sm">Overview content</div>
                    </TabsContent>
                    <TabsContent value="analytics">
                        <div className="pt-3 text-slate-700 text-sm">Analytics content</div>
                    </TabsContent>
                    <TabsContent value="reports">
                        <div className="pt-3 text-slate-700 text-sm">Reports content</div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Vertical</p>
                <Tabs defaultValue="profile" orientation="vertical" className="w-full max-w-lg">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700 text-sm">
                            Profile information
                        </div>
                    </TabsContent>
                    <TabsContent value="billing">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700 text-sm">
                            Billing details
                        </div>
                    </TabsContent>
                    <TabsContent value="security">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700 text-sm">
                            Security settings
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Disabled tab</p>
                <Tabs defaultValue="tab1" className="w-full max-w-lg">
                    <TabsList>
                        <TabsTrigger value="tab1">Active</TabsTrigger>
                        <TabsTrigger value="tab2" disabled>Disabled</TabsTrigger>
                        <TabsTrigger value="tab3">Normal</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700 text-sm">
                            Active tab content
                        </div>
                    </TabsContent>
                    <TabsContent value="tab3">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700 text-sm">
                            Normal tab content
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Icons</p>
                <Tabs defaultValue="preview" className="w-full max-w-lg">
                    <TabsList>
                        <TabsTrigger value="preview">
                            <AppWindowIcon />
                            Preview
                        </TabsTrigger>
                        <TabsTrigger value="code">
                            <CodeIcon />
                            Code
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview">
                        <div className="rounded-lg border border-slate-200 p-4 text-slate-700 text-sm">
                            Visual preview
                        </div>
                    </TabsContent>
                    <TabsContent value="code">
                        <div className="rounded-lg border border-slate-200 p-4 font-mono text-slate-700 text-sm">
                            &lt;Component /&gt;
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

        </section>
    )
}

function TogglePreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Toggle</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Default</p>
                <div className="flex flex-wrap items-center gap-2">
                    <Toggle aria-label="Toggle italic">
                        <ItalicIcon />
                        Italic
                    </Toggle>
                    <Toggle aria-label="Toggle bold">
                        <BoldIcon />
                        Bold
                    </Toggle>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Outline</p>
                <div className="flex flex-wrap items-center gap-2">
                    <Toggle variant="outline" aria-label="Toggle italic">
                        <ItalicIcon />
                        Italic
                    </Toggle>
                    <Toggle variant="outline" aria-label="Toggle bold">
                        <BoldIcon />
                        Bold
                    </Toggle>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With text</p>
                <Toggle aria-label="Toggle italic">
                    <ItalicIcon />
                    Italic
                </Toggle>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Size</p>
                <div className="flex flex-wrap items-center gap-2">
                    <Toggle variant="outline" aria-label="Toggle small" size="sm">
                        Small
                    </Toggle>
                    <Toggle variant="outline" aria-label="Toggle default" size="default">
                        Default
                    </Toggle>
                    <Toggle variant="outline" aria-label="Toggle large" size="lg">
                        Large
                    </Toggle>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Disabled</p>
                <div className="flex flex-wrap items-center gap-2">
                    <Toggle aria-label="Toggle disabled" disabled>
                        Disabled
                    </Toggle>
                    <Toggle variant="outline" aria-label="Toggle disabled outline" disabled>
                        Disabled
                    </Toggle>
                </div>
            </div>

        </section>
    )
}

type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

const paymentData: Payment[] = [
    { id: "a1b2c3d4", amount: 100,  status: "pending",    email: "alice@example.com"   },
    { id: "e5f6g7h8", amount: 250,  status: "success",    email: "bob@example.com"     },
    { id: "i9j0k1l2", amount: 75,   status: "processing", email: "carol@example.com"   },
    { id: "m3n4o5p6", amount: 500,  status: "failed",     email: "david@example.com"   },
    { id: "q7r8s9t0", amount: 125,  status: "success",    email: "eve@example.com"     },
    { id: "u1v2w3x4", amount: 340,  status: "pending",    email: "frank@example.com"   },
    { id: "y5z6a7b8", amount: 89,   status: "success",    email: "grace@example.com"   },
    { id: "c9d0e1f2", amount: 420,  status: "processing", email: "henry@example.com"   },
    { id: "g3h4i5j6", amount: 60,   status: "failed",     email: "iris@example.com"    },
    { id: "k7l8m9n0", amount: 195,  status: "success",    email: "jack@example.com"    },
    { id: "o1p2q3r4", amount: 310,  status: "pending",    email: "kate@example.com"    },
    { id: "s5t6u7v8", amount: 45,   status: "success",    email: "liam@example.com"    },
]

const statusBadgeClass: Record<Payment["status"], string> = {
    pending:    "bg-yellow-50 text-yellow-700 border border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border border-blue-200",
    success:    "bg-green-50 text-green-700 border border-green-200",
    failed:     "bg-red-50 text-red-700 border border-red-200",
}

const paymentColumns: ColumnDef<Payment>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as Payment["status"]
            return (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClass[status]}`}>
                    {status}
                </span>
            )
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontalIcon />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            Copy payment ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

function DataTablePreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Data Table</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With sorting, filtering, pagination, visibility and row selection</p>
                <DataTable
                    columns={paymentColumns}
                    data={paymentData}
                    filterColumn="email"
                    filterPlaceholder="Filter by email..."
                />
            </div>

        </section>
    )
}

const DRAWER_SIDES = ["top", "right", "bottom", "left"] as const

function DrawerProfileForm({ className }: { className?: string }) {
    return (
        <form className={cn("grid items-start gap-6", className)}>
            <div className="grid gap-3">
                <Label htmlFor="drawer-email">Email</Label>
                <Input type="email" id="drawer-email" defaultValue="user@example.com" />
            </div>
            <div className="grid gap-3">
                <Label htmlFor="drawer-username">Username</Label>
                <Input id="drawer-username" defaultValue="@user" />
            </div>
            <Button type="submit">Save changes</Button>
        </form>
    )
}

function DrawerResponsiveDemo() {
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <DrawerProfileForm />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Edit profile</DrawerTitle>
                    <DrawerDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerProfileForm className="px-4" />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function DrawerPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Drawer</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Scrollable content (right)</p>
                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button variant="outline">Open Drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Move Goal</DrawerTitle>
                            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                        </DrawerHeader>
                        <div className="overflow-y-auto px-4">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <p key={index} className="mb-4 leading-normal text-slate-600">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                    enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                    nisi ut aliquip ex ea commodo consequat.
                                </p>
                            ))}
                        </div>
                        <DrawerFooter>
                            <Button>Submit</Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sides</p>
                <div className="flex flex-wrap gap-2">
                    {DRAWER_SIDES.map((side) => (
                        <Drawer
                            key={side}
                            direction={side === "bottom" ? undefined : side}
                        >
                            <DrawerTrigger asChild>
                                <Button variant="outline" className="capitalize">
                                    {side}
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
                                <DrawerHeader>
                                    <DrawerTitle>Move Goal</DrawerTitle>
                                    <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                                </DrawerHeader>
                                <div className="overflow-y-auto px-4">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <p key={index} className="mb-4 leading-normal text-slate-600">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                                            do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                        </p>
                                    ))}
                                </div>
                                <DrawerFooter>
                                    <Button>Submit</Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Responsive dialog (Dialog on desktop, Drawer on mobile)</p>
                <DrawerResponsiveDemo />
            </div>

        </section>
    )
}

function EmptyPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Empty</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Outline</p>
                <Empty className="border border-dashed border-slate-200 max-w-lg">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CloudIcon />
                        </EmptyMedia>
                        <EmptyTitle>Cloud Storage Empty</EmptyTitle>
                        <EmptyDescription>
                            Upload files to your cloud storage to access them anywhere.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button variant="outline" size="sm">
                            Upload Files
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Background</p>
                <Empty className="h-48 bg-slate-50 max-w-lg">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BellIcon />
                        </EmptyMedia>
                        <EmptyTitle>No Notifications</EmptyTitle>
                        <EmptyDescription className="max-w-xs">
                            You&apos;re all caught up. New notifications will appear here.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button variant="outline" size="sm">
                            Refresh
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Avatar</p>
                <Empty className="max-w-lg">
                    <EmptyHeader>
                        <EmptyMedia variant="default">
                            <Avatar className="size-12">
                                <AvatarImage src="https://github.com/shadcn.png" className="grayscale" />
                                <AvatarFallback>LR</AvatarFallback>
                            </Avatar>
                        </EmptyMedia>
                        <EmptyTitle>User Offline</EmptyTitle>
                        <EmptyDescription>
                            This user is currently offline. You can leave a message to notify them or try again later.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button size="sm">Leave Message</Button>
                    </EmptyContent>
                </Empty>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Avatar group</p>
                <Empty className="max-w-lg">
                    <EmptyHeader>
                        <EmptyMedia>
                            <div className="flex -space-x-2 [&>[data-slot=avatar]]:size-12 [&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-white [&>[data-slot=avatar]]:grayscale">
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
                                    <AvatarFallback>ML</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                                    <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                            </div>
                        </EmptyMedia>
                        <EmptyTitle>No Team Members</EmptyTitle>
                        <EmptyDescription>
                            Invite your team to collaborate on this project.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button size="sm">
                            <PlusIcon />
                            Invite Members
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With search input</p>
                <Empty className="max-w-lg">
                    <EmptyHeader>
                        <EmptyTitle>404 - Not Found</EmptyTitle>
                        <EmptyDescription>
                            The page you&apos;re looking for doesn&apos;t exist. Try searching for what you need below.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <InputGroup className="sm:w-3/4">
                            <InputGroupAddon>
                                <SearchIcon />
                            </InputGroupAddon>
                            <InputGroupInput placeholder="Try searching for pages..." />
                        </InputGroup>
                        <EmptyDescription>
                            Need help? <a href="#">Contact support</a>
                        </EmptyDescription>
                    </EmptyContent>
                </Empty>
            </div>

        </section>
    )
}

const HOVER_CARD_SIDES = ["left", "top", "bottom", "right"] as const

function HoverCardPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Hover Card</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <HoverCard openDelay={10} closeDelay={100}>
                    <HoverCardTrigger asChild>
                        <Button variant="link">Hover Here</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="flex w-64 flex-col gap-0.5">
                        <div className="font-semibold">@nextjs</div>
                        <div>The React Framework – created and maintained by @vercel.</div>
                        <div className="mt-1 text-xs text-slate-500">
                            Joined December 2021
                        </div>
                    </HoverCardContent>
                </HoverCard>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sides</p>
                <div className="flex flex-wrap gap-2">
                    {HOVER_CARD_SIDES.map((side) => (
                        <HoverCard key={side} openDelay={100} closeDelay={100}>
                            <HoverCardTrigger asChild>
                                <Button variant="outline" className="capitalize">
                                    {side}
                                </Button>
                            </HoverCardTrigger>
                            <HoverCardContent side={side}>
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium">Hover Card</p>
                                    <p className="text-slate-500">This hover card appears on the {side} side.</p>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    ))}
                </div>
            </div>

        </section>
    )
}

function InputOTPControlledPreview() {
    const [value, setValue] = useState("")
    return (
        <div className="space-y-2">
            <InputOTP maxLength={6} value={value} onChange={(v) => setValue(v)}>
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
            <div className="text-center text-sm text-slate-500">
                {value === "" ? <>Enter your one-time password.</> : <>You entered: {value}</>}
            </div>
        </div>
    )
}

function InputOTPInvalidPreview() {
    const [value, setValue] = useState("000000")
    return (
        <InputOTP maxLength={6} value={value} onChange={setValue}>
            <InputOTPGroup>
                <InputOTPSlot index={0} aria-invalid />
                <InputOTPSlot index={1} aria-invalid />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                <InputOTPSlot index={2} aria-invalid />
                <InputOTPSlot index={3} aria-invalid />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                <InputOTPSlot index={4} aria-invalid />
                <InputOTPSlot index={5} aria-invalid />
            </InputOTPGroup>
        </InputOTP>
    )
}

function InputOTPPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Input OTP</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Separator</p>
                <InputOTP maxLength={6}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Disabled</p>
                <InputOTP maxLength={6} disabled value="123456">
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Controlled</p>
                <InputOTPControlledPreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Invalid</p>
                <InputOTPInvalidPreview />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Four digits only</p>
                <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Alphanumeric</p>
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Form</p>
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle>Verify your login</CardTitle>
                        <CardDescription>
                            Enter the verification code we sent to your email address:{" "}
                            <span className="font-medium">m@example.com</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Field>
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="otp-verification">Verification code</FieldLabel>
                                <Button variant="outline" size="xs">
                                    Resend Code
                                </Button>
                            </div>
                            <InputOTP maxLength={6} id="otp-verification" required>
                                <InputOTPGroup className="[&>[data-slot=input-otp-slot]]:h-12 [&>[data-slot=input-otp-slot]]:w-11 [&>[data-slot=input-otp-slot]]:text-xl">
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator className="mx-2" />
                                <InputOTPGroup className="[&>[data-slot=input-otp-slot]]:h-12 [&>[data-slot=input-otp-slot]]:w-11 [&>[data-slot=input-otp-slot]]:text-xl">
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            <FieldDescription>
                                <a href="#">I no longer have access to this email address.</a>
                            </FieldDescription>
                        </Field>
                    </CardContent>
                    <CardFooter>
                        <Field>
                            <Button type="submit" className="w-full">Verify</Button>
                            <div className="text-sm text-slate-500">
                                Having trouble signing in?{" "}
                                <a href="#" className="underline underline-offset-4 transition-colors hover:text-slate-700">
                                    Contact support
                                </a>
                            </div>
                        </Field>
                    </CardFooter>
                </Card>
            </div>

        </section>
    )
}

const itemPeople = [
    { username: "shadcn",    avatar: "https://github.com/shadcn.png",    email: "shadcn@vercel.com"    },
    { username: "maxleiter", avatar: "https://github.com/maxleiter.png", email: "maxleiter@vercel.com" },
    { username: "evilrabbit", avatar: "https://github.com/evilrabbit.png", email: "evilrabbit@vercel.com" },
]

const itemMusic = [
    { title: "Midnight City Lights",      artist: "Neon Dreams",     album: "Electric Nights", duration: "3:45" },
    { title: "Coffee Shop Conversations", artist: "The Morning Brew", album: "Urban Stories",   duration: "4:05" },
    { title: "Digital Rain",              artist: "Cyber Symphony",   album: "Binary Beats",    duration: "3:30" },
]

const itemModels = [
    { name: "v0-1.5-sm",   description: "Everyday tasks and UI generation.",    image: "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop" },
    { name: "v0-1.5-lg",   description: "Advanced thinking or reasoning.",      image: "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop" },
    { name: "v0-2.0-mini", description: "Open Source model for everyone.",      image: "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop" },
]

function ItemPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Item</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Icon</p>
                <div className="w-full max-w-lg">
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <ShieldAlertIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Security Alert</ItemTitle>
                            <ItemDescription>New login detected from unknown device.</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button size="sm" variant="outline">Review</Button>
                        </ItemActions>
                    </Item>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Avatar</p>
                <div className="flex w-full max-w-lg flex-col gap-3">
                    <Item variant="outline">
                        <ItemMedia>
                            <Avatar className="size-10">
                                <AvatarImage src="https://github.com/evilrabbit.png" />
                                <AvatarFallback>ER</AvatarFallback>
                            </Avatar>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>Evil Rabbit</ItemTitle>
                            <ItemDescription>Last seen 5 months ago</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button size="icon-sm" variant="outline" className="rounded-full" aria-label="Invite">
                                <PlusIcon />
                            </Button>
                        </ItemActions>
                    </Item>
                    <Item variant="outline">
                        <ItemMedia>
                            <div className="flex -space-x-2 [&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-white [&>[data-slot=avatar]]:grayscale">
                                <Avatar className="hidden sm:flex">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <Avatar className="hidden sm:flex">
                                    <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
                                    <AvatarFallback>ML</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                                    <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                            </div>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>No Team Members</ItemTitle>
                            <ItemDescription>Invite your team to collaborate on this project.</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button size="sm" variant="outline">Invite</Button>
                        </ItemActions>
                    </Item>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Image</p>
                <div className="w-full max-w-md">
                    <ItemGroup className="gap-4">
                        {itemMusic.map((song) => (
                            <Item key={song.title} variant="outline" asChild>
                                <a href="#">
                                    <ItemMedia variant="image">
                                        <img
                                            src={`https://avatar.vercel.sh/${encodeURIComponent(song.title)}`}
                                            alt={song.title}
                                            className="size-full object-cover grayscale"
                                        />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>
                                            {song.title}{" "}
                                            <span className="font-normal text-slate-500">— {song.album}</span>
                                        </ItemTitle>
                                        <ItemDescription>{song.artist}</ItemDescription>
                                    </ItemContent>
                                    <ItemContent className="flex-none text-center">
                                        <ItemDescription>{song.duration}</ItemDescription>
                                    </ItemContent>
                                </a>
                            </Item>
                        ))}
                    </ItemGroup>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Group</p>
                <ItemGroup className="max-w-sm">
                    {itemPeople.map((person) => (
                        <Item key={person.username} variant="outline">
                            <ItemMedia>
                                <Avatar>
                                    <AvatarImage src={person.avatar} className="grayscale" />
                                    <AvatarFallback>{person.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </ItemMedia>
                            <ItemContent className="gap-1">
                                <ItemTitle>{person.username}</ItemTitle>
                                <ItemDescription>{person.email}</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <PlusIcon />
                                </Button>
                            </ItemActions>
                        </Item>
                    ))}
                </ItemGroup>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Header (card grid)</p>
                <div className="w-full max-w-xl">
                    <ItemGroup className="grid grid-cols-3 gap-4">
                        {itemModels.map((model) => (
                            <Item key={model.name} variant="outline">
                                <ItemHeader>
                                    <img
                                        src={model.image}
                                        alt={model.name}
                                        className="aspect-square w-full rounded-sm object-cover"
                                    />
                                </ItemHeader>
                                <ItemContent>
                                    <ItemTitle>{model.name}</ItemTitle>
                                    <ItemDescription>{model.description}</ItemDescription>
                                </ItemContent>
                            </Item>
                        ))}
                    </ItemGroup>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Link</p>
                <div className="flex w-full max-w-md flex-col gap-4">
                    <Item asChild>
                        <a href="#">
                            <ItemContent>
                                <ItemTitle>Visit our documentation</ItemTitle>
                                <ItemDescription>Learn how to get started with our components.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </a>
                    </Item>
                    <Item variant="outline" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                            <ItemContent>
                                <ItemTitle>External resource</ItemTitle>
                                <ItemDescription>Opens in a new tab with security attributes.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ExternalLinkIcon className="size-4" />
                            </ItemActions>
                        </a>
                    </Item>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Dropdown</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Select <ChevronDownIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48" align="end">
                        <DropdownMenuGroup>
                            {itemPeople.map((person) => (
                                <DropdownMenuItem key={person.username}>
                                    <Item size="xs" className="w-full">
                                        <ItemMedia>
                                            <Avatar className="size-[26px]">
                                                <AvatarImage src={person.avatar} className="grayscale" />
                                                <AvatarFallback>{person.username.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </ItemMedia>
                                        <ItemContent className="gap-0">
                                            <ItemTitle>{person.username}</ItemTitle>
                                            <ItemDescription className="leading-none">{person.email}</ItemDescription>
                                        </ItemContent>
                                    </Item>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </section>
    )
}

const sidebarNavItems = [
    { title: 'Home',     icon: HomeIcon,        url: '#' },
    { title: 'Inbox',    icon: InboxIcon,       url: '#' },
    { title: 'Calendar', icon: CalendarIcon,    url: '#' },
    { title: 'Settings', icon: SettingsIcon,    url: '#' },
    { title: 'Help',     icon: HelpCircleIcon,  url: '#' },
]

function SidebarPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Sidebar</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <div className="overflow-hidden rounded-lg border border-slate-200 h-[400px]">
                    <SidebarProvider style={{ '--sidebar-width': '14rem' } as CSSProperties}>
                        <Sidebar collapsible="none" className="border-r border-slate-200">
                            <SidebarHeader className="border-b border-slate-200 px-4 py-3">
                                <span className="text-sm font-semibold text-slate-700">Linkiu.io</span>
                            </SidebarHeader>
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {sidebarNavItems.map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton asChild>
                                                        <a href={item.url}>
                                                            <item.icon />
                                                            <span>{item.title}</span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                            <SidebarFooter className="border-t border-slate-200 p-4">
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-7">
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-slate-700">John Doe</span>
                                        <span className="text-xs text-slate-500">john@example.com</span>
                                    </div>
                                </div>
                            </SidebarFooter>
                        </Sidebar>
                        <SidebarInset className="flex flex-col">
                            <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                                <SidebarTrigger />
                                <SidebarSeparator orientation="vertical" className="h-4" />
                                <span className="text-sm text-slate-500">Dashboard</span>
                            </header>
                            <div className="flex flex-1 items-center justify-center p-6">
                                <p className="text-sm text-slate-500">Main content area</p>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With groups and active state</p>
                <div className="overflow-hidden rounded-lg border border-slate-200 h-[420px]">
                    <SidebarProvider style={{ '--sidebar-width': '14rem' } as CSSProperties}>
                        <Sidebar collapsible="none" className="border-r border-slate-200">
                            <SidebarHeader className="border-b border-slate-200 px-4 py-3">
                                <span className="text-sm font-semibold text-slate-700">Workspace</span>
                            </SidebarHeader>
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarGroupLabel>Main</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {sidebarNavItems.slice(0, 3).map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton asChild isActive={item.title === 'Home'}>
                                                        <a href={item.url}>
                                                            <item.icon />
                                                            <span>{item.title}</span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                                <SidebarSeparator />
                                <SidebarGroup>
                                    <SidebarGroupLabel>Support</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {sidebarNavItems.slice(3).map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton asChild>
                                                        <a href={item.url}>
                                                            <item.icon />
                                                            <span>{item.title}</span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                        </Sidebar>
                        <SidebarInset className="flex flex-col">
                            <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                                <SidebarTrigger />
                                <SidebarSeparator orientation="vertical" className="h-4" />
                                <span className="text-sm text-slate-500">Home</span>
                            </header>
                            <div className="flex flex-1 items-center justify-center p-6">
                                <p className="text-sm text-slate-500">Main content area</p>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With badge</p>
                <div className="overflow-hidden rounded-lg border border-slate-200 h-[300px]">
                    <SidebarProvider style={{ '--sidebar-width': '14rem' } as CSSProperties}>
                        <Sidebar collapsible="none" className="border-r border-slate-200">
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <a href="#">
                                                        <HomeIcon />
                                                        <span>Home</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <a href="#">
                                                        <InboxIcon />
                                                        <span>Inbox</span>
                                                    </a>
                                                </SidebarMenuButton>
                                                <Badge className="ml-auto mr-2 px-1.5 py-0.5 text-[10px]">12</Badge>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <a href="#">
                                                        <BellIcon />
                                                        <span>Notifications</span>
                                                    </a>
                                                </SidebarMenuButton>
                                                <Badge variant="destructive" className="ml-auto mr-2 px-1.5 py-0.5 text-[10px]">3</Badge>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                        </Sidebar>
                        <SidebarInset className="flex flex-col">
                            <div className="flex flex-1 items-center justify-center p-6">
                                <p className="text-sm text-slate-500">Content area</p>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </div>
            </div>
        </section>
    )
}

function TooltipPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Tooltip</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline">Hover me</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add to library</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Sides</p>
                <TooltipProvider>
                    <div className="flex flex-wrap gap-2">
                        {(['left', 'top', 'bottom', 'right'] as const).map((side) => (
                            <Tooltip key={side}>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" className="capitalize">{side}</Button>
                                </TooltipTrigger>
                                <TooltipContent side={side}>
                                    <p>Add to library</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">With keyboard shortcut</p>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon-sm">
                                <SaveIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Save changes{' '}
                            <kbd className="ml-0.5 rounded border border-white/20 bg-white/10 px-1 py-0.5 font-mono text-[10px] leading-none">S</kbd>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Disabled button</p>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-block w-fit">
                                <Button variant="outline" disabled>Disabled</Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This feature is currently unavailable</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </section>
    )
}

function CalendarBasicDemo() {
    const [date, setDate] = useState<Date | undefined>(undefined)
    return (
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border border-slate-200"
        />
    )
}

function CalendarRangeDemo() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 12),
        to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
    })
    return (
        <Card className="mx-auto w-fit p-0">
            <CardContent className="p-0">
                <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                    }
                />
            </CardContent>
        </Card>
    )
}

function CalendarPresetsDemo() {
    const [date, setDate] = useState<Date | undefined>(
        new Date(new Date().getFullYear(), 1, 12)
    )
    const [currentMonth, setCurrentMonth] = useState<Date>(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    )
    return (
        <Card className="mx-auto w-fit max-w-[300px]" size="sm">
            <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    fixedWeeks
                    className="p-0 [--cell-size:2.375rem]"
                />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {[
                    { label: 'Today',     value: 0  },
                    { label: 'Tomorrow',  value: 1  },
                    { label: 'In 3 days', value: 3  },
                    { label: 'In a week', value: 7  },
                    { label: 'In 2 weeks',value: 14 },
                ].map((preset) => (
                    <Button
                        key={preset.value}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            const newDate = addDays(new Date(), preset.value)
                            setDate(newDate)
                            setCurrentMonth(
                                new Date(newDate.getFullYear(), newDate.getMonth(), 1)
                            )
                        }}
                    >
                        {preset.label}
                    </Button>
                ))}
            </CardFooter>
        </Card>
    )
}

function CalendarWithTimeDemo() {
    const [date, setDate] = useState<Date | undefined>(
        new Date(new Date().getFullYear(), new Date().getMonth(), 12)
    )
    return (
        <Card size="sm" className="mx-auto w-fit">
            <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                />
            </CardContent>
            <CardFooter className="border-t">
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="cal-time-from" className="text-xs">Start Time</Label>
                        <InputGroup>
                            <InputGroupInput
                                id="cal-time-from"
                                type="time"
                                step="1"
                                defaultValue="10:30:00"
                                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                            <InputGroupAddon>
                                <Clock2Icon className="size-4 text-slate-500" />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="cal-time-to" className="text-xs">End Time</Label>
                        <InputGroup>
                            <InputGroupInput
                                id="cal-time-to"
                                type="time"
                                step="1"
                                defaultValue="12:30:00"
                                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                            <InputGroupAddon>
                                <Clock2Icon className="size-4 text-slate-500" />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}

function CalendarBookedDatesDemo() {
    const [date, setDate] = useState<Date | undefined>(
        new Date(new Date().getFullYear(), 1, 3)
    )
    const bookedDates = Array.from(
        { length: 15 },
        (_, i) => new Date(new Date().getFullYear(), 1, 12 + i)
    )
    return (
        <Card className="mx-auto w-fit p-0">
            <CardContent className="p-0">
                <Calendar
                    mode="single"
                    defaultMonth={date}
                    selected={date}
                    onSelect={setDate}
                    disabled={bookedDates}
                    modifiers={{ booked: bookedDates }}
                    modifiersClassNames={{
                        booked: '[&>button]:line-through opacity-100',
                    }}
                />
            </CardContent>
        </Card>
    )
}

function CalendarCustomCellDemo() {
    const [range, setRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 11, 8),
        to: addDays(new Date(new Date().getFullYear(), 11, 8), 10),
    })
    return (
        <Card className="mx-auto w-fit p-0">
            <CardContent className="p-0">
                <Calendar
                    mode="range"
                    defaultMonth={range?.from}
                    selected={range}
                    onSelect={setRange}
                    captionLayout="dropdown"
                    className="[--cell-size:2.5rem] md:[--cell-size:3rem]"
                    formatters={{
                        formatMonthDropdown: (date) =>
                            date.toLocaleString('default', { month: 'long' }),
                    }}
                    components={{
                        DayButton: ({ children, modifiers, day, ...props }) => {
                            const isWeekend =
                                day.date.getDay() === 0 || day.date.getDay() === 6
                            return (
                                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                                    {children}
                                    {!modifiers.outside && (
                                        <span>{isWeekend ? '$120' : '$100'}</span>
                                    )}
                                </CalendarDayButton>
                            )
                        },
                    }}
                />
            </CardContent>
        </Card>
    )
}

function CalendarPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Calendar</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <CalendarBasicDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Range</p>
                <CalendarRangeDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Month and year selector</p>
                <Card className="mx-auto w-fit p-0">
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            className="rounded-lg"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Presets</p>
                <CalendarPresetsDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Date and time picker</p>
                <CalendarWithTimeDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Booked dates</p>
                <CalendarBookedDatesDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Custom cell size with price</p>
                <CalendarCustomCellDemo />
            </div>
        </section>
    )
}

function DatePickerSimpleDemo() {
    const [date, setDate] = useState<Date | undefined>(undefined)
    return (
        <Field className="w-44">
            <FieldLabel htmlFor="date-picker-simple">Date</FieldLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-simple"
                        className="justify-start font-normal"
                    >
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        defaultMonth={date}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    )
}

function DatePickerRangeDemo() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 20),
        to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
    })
    return (
        <Field className="w-64">
            <FieldLabel htmlFor="date-picker-range">Date Range</FieldLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-range"
                        className="justify-start px-2.5 font-normal"
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'LLL dd, y')} &ndash;{' '}
                                    {format(date.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    )
}

function DatePickerDOBDemo() {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    return (
        <Field className="w-44">
            <FieldLabel htmlFor="date-dob">Date of birth</FieldLabel>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-dob"
                        className="justify-start font-normal"
                    >
                        {date ? date.toLocaleDateString() : 'Select date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        defaultMonth={date}
                        captionLayout="dropdown"
                        onSelect={(d) => {
                            setDate(d)
                            setOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    )
}

function formatDateStr(date: Date | undefined) {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

function isValidDate(date: Date | undefined) {
    if (!date) return false
    return !isNaN(date.getTime())
}

function DatePickerInputDemo() {
    const initialDate = new Date('2025-06-01')
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(initialDate)
    const [month, setMonth] = useState<Date | undefined>(initialDate)
    const [value, setValue] = useState(formatDateStr(initialDate))

    return (
        <Field className="w-52">
            <FieldLabel htmlFor="date-input">Subscription Date</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id="date-input"
                    value={value}
                    placeholder="June 01, 2025"
                    onChange={(e) => {
                        const d = new Date(e.target.value)
                        setValue(e.target.value)
                        if (isValidDate(d)) {
                            setDate(d)
                            setMonth(d)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />
                <InputGroupAddon align="inline-end">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <InputGroupButton
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Select date"
                            >
                                <CalendarIcon />
                            </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="end"
                            alignOffset={-8}
                            sideOffset={10}
                        >
                            <Calendar
                                mode="single"
                                selected={date}
                                month={month}
                                onMonthChange={setMonth}
                                onSelect={(d) => {
                                    setDate(d)
                                    setValue(formatDateStr(d))
                                    setOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    )
}

function DatePickerTimeDemo() {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    return (
        <div className="flex flex-row items-end gap-3">
            <Field>
                <FieldLabel htmlFor="date-time-date">Date</FieldLabel>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-time-date"
                            className="w-32 justify-between font-normal"
                        >
                            {date ? format(date, 'PPP') : 'Select date'}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            defaultMonth={date}
                            onSelect={(d) => {
                                setDate(d)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </Field>
            <Field className="w-32">
                <FieldLabel htmlFor="date-time-time">Time</FieldLabel>
                <Input
                    type="time"
                    id="date-time-time"
                    step="1"
                    defaultValue="10:30:00"
                    className="appearance-none bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
            </Field>
        </div>
    )
}

function DatePickerNaturalDemo() {
    const [open, setOpen] = useState(false)
    const initialValue = 'In 2 days'
    const [value, setValue] = useState(initialValue)
    const [date, setDate] = useState<Date | undefined>(
        parseDate(initialValue) || undefined
    )

    return (
        <Field className="max-w-xs">
            <FieldLabel htmlFor="date-natural">Schedule Date</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id="date-natural"
                    value={value}
                    placeholder="Tomorrow or next week"
                    onChange={(e) => {
                        setValue(e.target.value)
                        const parsed = parseDate(e.target.value)
                        if (parsed) setDate(parsed)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />
                <InputGroupAddon align="inline-end">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <InputGroupButton
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Select date"
                            >
                                <CalendarIcon />
                            </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="end"
                            sideOffset={8}
                        >
                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                defaultMonth={date}
                                onSelect={(d) => {
                                    setDate(d)
                                    setValue(formatDateStr(d))
                                    setOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </InputGroupAddon>
            </InputGroup>
            <p className="px-1 text-sm text-slate-500">
                Your post will be published on{' '}
                <span className="font-medium text-slate-700">{formatDateStr(date)}</span>.
            </p>
        </Field>
    )
}

function DatePickerPreview() {
    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Date Picker</h2>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Basic</p>
                <DatePickerSimpleDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Range picker</p>
                <DatePickerRangeDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Date of birth (dropdown + auto-close)</p>
                <DatePickerDOBDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Input with calendar toggle</p>
                <DatePickerInputDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Date and time</p>
                <DatePickerTimeDemo />
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-500">Natural language</p>
                <DatePickerNaturalDemo />
            </div>
        </section>
    )
}

function SonnerPreview() {
    const simulateUpload = () =>
        new Promise<{ name: string }>((resolve) =>
            setTimeout(() => resolve({ name: 'archivo.pdf' }), 2500)
        )

    const simulateAction = () =>
        new Promise<void>((resolve) => setTimeout(resolve, 2000))

    return (
        <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-700">Toast (Sonner)</h2>
            <p className="text-sm text-slate-500">
                Todos los toasts aparecen en{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">bottom-center</code>.
                Haz click en cada variante para dispararlo.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Default</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast('Nuevo comentario publicado.')}
                    >
                        Default
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Success</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.success('Cambios guardados correctamente.')}
                    >
                        Success
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Error</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.error('Error al conectar con el servidor.')}
                    >
                        Error
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Info</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.info('Nueva versión disponible.')}
                    >
                        Info
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Warning</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.warning('Tu sesión expirará en 5 minutos.')}
                    >
                        Warning
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Loading</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            const id = toast.loading('Procesando solicitud...')
                            setTimeout(() => toast.dismiss(id), 3000)
                        }}
                    >
                        Loading
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Upload file</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast.promise(simulateUpload(), {
                                loading: 'Subiendo archivo...',
                                success: (data) => `${data.name} subido correctamente.`,
                                error: 'Error al subir el archivo.',
                            })
                        }
                    >
                        <UploadIcon />
                        Upload file
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">With icon</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast('Despliegue completado', {
                                icon: <ZapIcon className="size-4 text-amber-500" />,
                            })
                        }
                    >
                        <ZapIcon />
                        With icon
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">With description</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast.success('Pedido confirmado', {
                                description: 'Tu pedido #4821 será procesado en breve.',
                            })
                        }
                    >
                        With description
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">With action</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast('Elemento eliminado', {
                                action: {
                                    label: 'Deshacer',
                                    onClick: () => toast.success('Acción deshecha.'),
                                },
                            })
                        }
                    >
                        With action
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Action + cancel</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast('¿Eliminar este archivo?', {
                                description: 'Esta acción no se puede deshacer.',
                                action: {
                                    label: 'Eliminar',
                                    onClick: () => toast.error('Archivo eliminado.'),
                                },
                                cancel: {
                                    label: 'Cancelar',
                                    onClick: () => {},
                                },
                            })
                        }
                    >
                        Action + cancel
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Persistent</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast('Modo mantenimiento activo', {
                                duration: Infinity,
                                icon: <BellRingIcon className="size-4" />,
                                action: {
                                    label: 'Cerrar',
                                    onClick: () => {},
                                },
                            })
                        }
                    >
                        Persistent
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Persistent message</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast.warning('Contrato por vencer', {
                                description: 'Tu plan Pro expira en 3 días. Renueva para no perder el acceso.',
                                duration: Infinity,
                                action: {
                                    label: 'Renovar',
                                    onClick: () => toast.success('Redirigiendo a pagos...'),
                                },
                                cancel: {
                                    label: 'Ahora no',
                                    onClick: () => {},
                                },
                            })
                        }
                    >
                        Persistent message
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Promise</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast.promise(simulateAction(), {
                                loading: 'Publicando cambios...',
                                success: '¡Cambios publicados!',
                                error: 'Error al publicar.',
                            })
                        }
                    >
                        <PackageIcon />
                        Promise
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">With close button</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast.info('Recuerda completar tu perfil.', {
                                closeButton: true,
                                duration: Infinity,
                            })
                        }
                    >
                        Close button
                    </Button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500">Custom JSX</p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            toast.custom(() => (
                                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-none">
                                    <ThumbsUpIcon className="size-4 shrink-0 text-emerald-500" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium">¡Excelente trabajo!</span>
                                        <span className="text-xs text-slate-500">Has completado 10 tareas hoy.</span>
                                    </div>
                                </div>
                            ))
                        }
                    >
                        Custom JSX
                    </Button>
                </div>

            </div>
        </section>
    )
}
