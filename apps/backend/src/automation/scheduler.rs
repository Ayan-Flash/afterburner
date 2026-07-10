use super::rule::ScheduleTrigger;

pub struct CronScheduler;

impl CronScheduler {
    pub fn matches(trigger: &ScheduleTrigger, now: &chrono::NaiveDateTime) -> bool {
        let parts: Vec<&str> = trigger.cron.split_whitespace().collect();
        if parts.len() != 5 {
            return false;
        }

        let minute = now.format("%M").to_string();
        let hour = now.format("%H").to_string();
        let day = now.format("%d").to_string();
        let month = now.format("%m").to_string();
        let weekday = now.format("%u").to_string();

        Self::field_matches(parts[0], &minute, 0, 59)
            && Self::field_matches(parts[1], &hour, 0, 23)
            && Self::field_matches(parts[2], &day, 1, 31)
            && Self::field_matches(parts[3], &month, 1, 12)
            && Self::field_matches(parts[4], &weekday, 1, 7)
    }

    fn field_matches(pattern: &str, value: &str, _min: u32, _max: u32) -> bool {
        if pattern == "*" {
            return true;
        }
        if let Some(step_str) = pattern.strip_prefix("*/") {
            if let Ok(step) = step_str.parse::<u32>() {
                if let Ok(v) = value.parse::<u32>() {
                    return step > 0 && v % step == 0;
                }
            }
        }
        if pattern.contains(',') {
            return pattern.split(',').any(|p| Self::field_matches(p.trim(), value, _min, _max));
        }
        if pattern.contains('-') {
            if let Some((start, end)) = pattern.split_once('-') {
                if let (Ok(s), Ok(e)) = (start.trim().parse::<u32>(), end.trim().parse::<u32>()) {
                    if let Ok(v) = value.parse::<u32>() {
                        return v >= s && v <= e;
                    }
                }
            }
        }
        pattern == value
    }
}
