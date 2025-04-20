
export function generateAccessCode(seed: number = 12345678910): string {
  // Use the seed to generate a deterministic random number
  const rand = Math.abs(Math.sin(seed));
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 10; i++) {
    const index = Math.floor((rand * (i + 1)) % characters.length);
    result += characters.charAt(index);
  }
  
  return result;
}

export function verifyAccessCode(inputCode: string): boolean {
  const validCode = generateAccessCode();
  return inputCode.toLowerCase() === validCode.toLowerCase();
}
