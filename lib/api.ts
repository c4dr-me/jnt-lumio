
async function handleApiResponse(res: Response) {
  if (res.status === 429) {
    const data = await res.json();
    throw new Error(data.error || "Too many requests, please try again later.");
  }
  if (!res.ok) {
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    throw new Error(data.error || "An error occurred");
  }
  return res.json();
}

export async function saveSummary(id: string, content: string) {
  const res = await fetch('/api/saveSummary', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, content }),
  });
  return handleApiResponse(res);
}

export async function shareSummary(summaryId: string, summary: string, recipients: string[]) {
  const res = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summaryId, summary, recipients }),
  });
  return handleApiResponse(res);
}

// export async function getSummary(id: string) {
//   const res = await fetch(`/api/summaries/${id}`);
//   return res.json();
// }

export async function summarize(transcript: string, prompt: string) {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, prompt }),
  });
  return handleApiResponse(res);
}

// export default function formatSummaryForEmail(summary: string) {
//   let formatted = summary.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

//   formatted = formatted.replace(
//     /(?:^|\n)(\d+)\.\s(.*?)(?=\n\d+\.|\n\n|$)/gs,
//     (_unused, _, item) => `<li>${item.trim()}</li>`
//   );
//   if (formatted.includes("<li>")) {
//     formatted = formatted.replace(/(<li>[\s\S]*<\/li>)/g, "<ol>$1</ol>");
//   }

//   formatted = formatted.replace(
//     /(?:^|\n)\*\s(.*?)(?=\n\* |\n\n|$)/gs,
//     (_, item) => `<li>${item.trim()}</li>`
//   );
//   if (formatted.includes("<li>") && !formatted.includes("<ol>")) {
//     formatted = formatted.replace(/(<li>[\s\S]*<\/li>)/g, "<ul>$1</ul>");
//   }
//   formatted = formatted.replace(/\n{2,}/g, "<br><br>");
//   formatted = formatted.replace(/\n/g, "<br>");

//   return formatted;
// }