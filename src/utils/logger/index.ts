/**
 * Basic logger function creator
 * @param debugMode we show the message on the console if debugMode is true
 * @returns         void function that shows the message if the flag is true
 */
export const loggerFactory =
  (debugMode: boolean | undefined) =>
  (messageKey: string, message?: string): void => {
    if (!!debugMode) {
      console.debug(messageKey, message);
    }
  };
