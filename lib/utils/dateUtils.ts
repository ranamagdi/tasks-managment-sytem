type FormatDateOptions = {
  short?: boolean 
}

export const formatDate = (
  dateInput?: string | Date,
  options: FormatDateOptions = {}
): string => {
  if (!dateInput) return ""

  const date =
    typeof dateInput === "string"
      ? new Date(dateInput)
      : dateInput

  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "short" })
  const year = date.getFullYear()


  if (options.short) {
    return `${month} ${day}`
  }

  
  return `${day} ${month} ${year}`
}