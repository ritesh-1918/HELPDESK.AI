import datetime

def calculate_sla_breach(priority: str, start_time: datetime.datetime = None) -> datetime.datetime:
    """
    Calculates the SLA breach time based on priority, accounting for
    business hours (09:00 to 17:00) and skipping weekends.
    Assumes all times are in UTC.
    """
    hours_map = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}
    remaining_hours = hours_map.get(priority, 72)
    
    if start_time is None:
        start_time = datetime.datetime.utcnow()
        
    current_time = start_time
    
    while remaining_hours > 0:
        # Skip weekends (5 = Saturday, 6 = Sunday)
        if current_time.weekday() >= 5:
            days_to_add = 7 - current_time.weekday()
            current_time = current_time + datetime.timedelta(days=days_to_add)
            current_time = current_time.replace(hour=9, minute=0, second=0, microsecond=0)
            continue
            
        # If before business hours, jump to 09:00
        if current_time.hour < 9:
            current_time = current_time.replace(hour=9, minute=0, second=0, microsecond=0)
            
        # If after business hours, jump to next day 09:00
        if current_time.hour >= 17:
            current_time = current_time + datetime.timedelta(days=1)
            current_time = current_time.replace(hour=9, minute=0, second=0, microsecond=0)
            continue
            
        # Calculate how much time is left in the current business day
        end_of_day = current_time.replace(hour=17, minute=0, second=0, microsecond=0)
        hours_left_in_day = (end_of_day - current_time).total_seconds() / 3600.0
        
        if remaining_hours <= hours_left_in_day:
            # Can finish SLA today
            current_time += datetime.timedelta(hours=remaining_hours)
            remaining_hours = 0
        else:
            # Need to roll over to the next day
            remaining_hours -= hours_left_in_day
            current_time = current_time + datetime.timedelta(days=1)
            current_time = current_time.replace(hour=9, minute=0, second=0, microsecond=0)
            
    return current_time
