import type * as React from 'react';

export interface RouteInfo { code: string; city: string; name?: string; basePrice: number; sensitivity: number; priceMin: number; priceMax: number }
export interface FlightRow { date: string; seats: number; demand: number[]; bestPrice: number }
export interface Forecast { seats: number; want: number; sold: number; free: number; overflow: number; scenarios: number[]; fillChance: number }
export interface CalendarDay { date: string; load: number; full?: boolean }
export interface CalendarInfo { days: CalendarDay[]; bestPrice: Record<string, number> }
export interface ForecastQuery { code: string; date: string; price: number }
export interface ForecastApi { loadCalendar: (code: string, price: number) => Promise<CalendarInfo>; loadForecast: (query: ForecastQuery) => Promise<Forecast> }
export declare function localApi(routes: RouteInfo[], flights: Record<string, FlightRow[]>): ForecastApi;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost'; block?: boolean; loading?: boolean }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; hint?: string; error?: string }
export declare function Field(props: FieldProps): React.ReactElement;
export declare function OriginField(): React.ReactElement;
export interface RouteSelectProps { routes: RouteInfo[]; value: string; onChange: (code: string) => void }
export declare function RouteSelect(props: RouteSelectProps): React.ReactElement;
export interface FlightCalendarProps { days: CalendarDay[]; value: string; onChange: (date: string) => void }
export declare function FlightCalendar(props: FlightCalendarProps): React.ReactElement;
export declare function DateSelect(props: FlightCalendarProps): React.ReactElement;
export interface PriceFieldProps { value: number; onChange: (price: number) => void; invalid?: boolean }
export declare function PriceField(props: PriceFieldProps): React.ReactElement;
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { active?: boolean }
export declare function Chip(props: ChipProps): React.ReactElement;
export interface PriceSliderProps { value: number; min: number; max: number; step?: number; onChange: (price: number) => void }
export declare function PriceSlider(props: PriceSliderProps): React.ReactElement;
export interface BadgeProps { tone?: 'neutral' | 'brand' | 'capacity'; children?: React.ReactNode }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface NoticeProps { tone?: 'brand' | 'capacity'; children?: React.ReactNode }
export declare function Notice(props: NoticeProps): React.ReactElement;
export interface OtpInputProps { value: string; onChange: (code: string) => void; length?: number; label?: string; error?: string }
export declare function OtpInput(props: OtpInputProps): React.ReactElement;
export interface StatProps { label: string; value: React.ReactNode; note?: React.ReactNode }
export declare function Stat(props: StatProps): React.ReactElement;
export interface ResultCardProps { result: Forecast }
export declare function StatRow(props: ResultCardProps): React.ReactElement;
export declare function ResultCard(props: ResultCardProps): React.ReactElement;
export interface TicketProps { to: string; city: string; date: string; price: number }
export declare function Ticket(props: TicketProps): React.ReactElement;
export interface LoadBarProps { seats: number; sold: number }
export declare function LoadBar(props: LoadBarProps): React.ReactElement;
export interface DemandChartProps { scenarios: number[]; seats: number }
export declare function DemandChart(props: DemandChartProps): React.ReactElement;
export interface DestinationsProps { routes: RouteInfo[]; images: Record<string, string>; value: string; onSelect: (code: string) => void }
export declare function Destinations(props: DestinationsProps): React.ReactElement;
export interface TopBarProps { children?: React.ReactNode }
export declare function TopBar(props: TopBarProps): React.ReactElement;
export interface ProfileUser { firstName: string; lastName: string }
export interface ProfileMenuProps { user: ProfileUser; onLogout?: () => void; defaultOpen?: boolean }
export declare function ProfileMenu(props: ProfileMenuProps): React.ReactElement;
export interface CardProps { title?: string; children?: React.ReactNode; className?: string }
export declare function Card(props: CardProps): React.ReactElement;
export interface WorkspaceScreenProps extends ForecastApi { routes: RouteInfo[]; user: ProfileUser; onLogout?: () => void; initialQuery?: ForecastQuery; initialResult?: Forecast; initialCalendar?: CalendarInfo; heroImage?: string; routeImages?: Record<string, string> }
export declare function WorkspaceScreen(props: WorkspaceScreenProps): React.ReactElement;
export interface ResultBoardProps { route: RouteInfo; date: string; price: number; result: Forecast; onPrice: (price: number) => void }
export declare function ResultBoard(props: ResultBoardProps): React.ReactElement;
export interface LandingScreenProps { routes: RouteInfo[]; loadDemo: (code: string, price: number) => Promise<Forecast>; demoStart: { code: string; date: string; result?: Forecast }; images: Record<string, string>; onRegister?: () => void; onLogin?: () => void }
export declare function LandingScreen(props: LandingScreenProps): React.ReactElement;
export interface RegisterData { firstName: string; lastName: string; email: string; password: string }
export interface AuthActions { register: (data: RegisterData) => Promise<string | void>; verify: (email: string, code: string) => Promise<string | void>; resend: (email: string) => Promise<string | void>; login: (email: string, password: string) => Promise<string | void | { needsCode: true }> }
export interface AuthScreenProps { initialStep?: 'register' | 'code' | 'login'; initialEmail?: string; heroImage?: string; actions?: AuthActions }
export declare function AuthScreen(props: AuthScreenProps): React.ReactElement;
