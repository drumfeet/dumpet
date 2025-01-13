const formatUnixTimestamp = (timestamp) => {
  try {
    // Ensure the timestamp is a number or a numeric string
    const parsedTimestamp = Number(timestamp)
    if (isNaN(parsedTimestamp)) {
      throw new Error("Invalid timestamp: Not a number.")
    }

    // Create a date object
    const date = new Date(parsedTimestamp)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid timestamp: Unable to parse into a valid date.")
    }

    // Formatting options
    const options = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use the local timezone
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    }

    // Format the date
    return new Intl.DateTimeFormat("en-US", options).format(date)
  } catch (error) {
    console.error("Error formatting timestamp:", error.message)
    return "" // Default error message for invalid input
  }
}

export default formatUnixTimestamp;