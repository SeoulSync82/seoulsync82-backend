/** 특정 타입의 개수를 results 배열에서 추출 */
export const findCountByType = (
  type: string,
  results: Array<{ type: string; count: string | number }>,
): number => {
  const item = results.find((entry) => entry.type === type);
  return item ? Number(item.count) : 0;
};
