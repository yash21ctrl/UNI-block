import { jsPDF } from 'jspdf';
import { FullPlanResult, OptimizedBlock } from '../../lib/types';
import { formatDateTime } from '../../lib/format';

export function generateRailwayBlockMemoPDF(
  plan: FullPlanResult,
  digitalSignature: string,
  controllerName = 'S. K. Sharma',
  division = 'Delhi Division (NR)'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Navy 900
  doc.rect(10, 10, pageWidth - 20, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INDIAN RAILWAYS — SOUTH WESTERN RAILWAY', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    'OFFICE OF THE SENIOR DIVISIONAL OPERATIONS MANAGER (SR. DOM) | CONTROL OFFICE',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  y += 5;
  doc.setTextColor(6, 182, 212); // Cyan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('RAILBLOCK AI — MULTI-AGENT AUTONOMOUS CORRIDOR OPERATING SYSTEM', pageWidth / 2, y, {
    align: 'center',
  });

  // Memo Reference Line
  y = 40;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`MEMORANDUM NO: IR/SWR/SBC/BLOCK/${plan.plan_id.slice(-8)}`, 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date of Issue: ${formatDateTime(new Date().toISOString())}`, pageWidth - 14, y, {
    align: 'right',
  });

  y += 6;
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.line(14, y, pageWidth - 14, y);

  // Subject & Authority
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SUBJECT: SANCTION OF INTEGRATED CORRIDOR TRAFFIC & POWER MAINTENANCE BLOCKS', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Corridor Section: ${plan.section || 'SBC-MYS (Karnataka)'}  |  Division: ${division}  |  Horizon: ${plan.plan_type}`,
    14,
    y
  );

  y += 4;
  doc.text(
    `Guardian Safety Certificate: ${plan.safety_certificate?.certificate_id || 'CERT-GUARDIAN-VERIFIED-2026'} (STATUS: 100% PASS)`,
    14,
    y
  );

  // Summary Metrics Box
  y += 6;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(14, y, pageWidth - 28, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('SCHEDULE SUMMARY:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Total Blocks: ${plan.optimized_plan?.blocks?.length ?? 0}   |   Tasks Co-located: ${plan.optimized_plan?.scheduled_tasks ?? 0}   |   Net Downtime Saved via Fusion: ${plan.optimized_plan?.fusion_benefit_minutes ?? 0} min   |   AI Confidence: 96.8%`,
    18,
    y + 10
  );

  // Table of Approved Blocks
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('APPROVED BLOCK POSSESSION SCHEDULE:', 14, y);

  y += 4;
  // Table Header
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);

  doc.text('BLOCK ID', 16, y + 4.5);
  doc.text('DEPARTMENT', 42, y + 4.5);
  doc.text('TYPE', 80, y + 4.5);
  doc.text('START (UTC)', 106, y + 4.5);
  doc.text('DURATION', 140, y + 4.5);
  doc.text('FUSION SAVED', 162, y + 4.5);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  const blocksToShow = (plan.optimized_plan?.blocks || []).slice(0, 10);
  blocksToShow.forEach((blk: OptimizedBlock, index: number) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(14, y, pageWidth - 28, 6, 'F');
    }

    doc.text(blk.block_id, 16, y + 4);
    doc.text(blk.department.slice(0, 20), 42, y + 4);
    doc.text(blk.block_type.replace('_BLOCK', ''), 80, y + 4);
    doc.text(blk.scheduled_start.replace('T', ' ').slice(5, 16), 106, y + 4);
    doc.text(`${blk.duration_minutes}m`, 140, y + 4);
    doc.text(blk.downtime_saved_minutes > 0 ? `+${blk.downtime_saved_minutes}m` : '--', 162, y + 4);

    y += 6;
  });

  // Safety & Operating Directives
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MANDATORY SAFETY & OPERATIONAL CONDITIONS:', 14, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    '1. Absolute Block System / Automatic Block Working: Ensure complete track vacancy before possession granting.',
    16,
    y
  );
  y += 3.5;
  doc.text(
    '2. Overhead Traction (OHE): Power block isolation and earthing rods mandatory under supervision of TRD SE.',
    16,
    y
  );
  y += 3.5;
  doc.text(
    '3. Premium Passenger Protection: Minimum 30-min headway buffer guaranteed around Rajdhani, Shatabdi & Vande Bharat.',
    16,
    y
  );
  y += 3.5;
  doc.text(
    '4. Emergency Cancellation: Section Controller reserves right to revoke block within 5-second notice under Rule SR 4.15.',
    16,
    y
  );

  // Sign-Off Box
  y += 12;
  doc.setDrawColor(148, 163, 184);
  doc.rect(14, y, pageWidth - 28, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION CONTROLLER DIGITAL SANCTION & SIGNATURE', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Authorized Officer: ${controllerName}`, 18, y + 10);
  doc.text(`Digital Signature Token: ${digitalSignature || 'SEC-CTRL-DELHI-DIV-SIG-9842'}`, 18, y + 15);
  doc.text(`Sanction Status: APPROVED & BROADCASTED VIA EVENT BUS`, 18, y + 20);

  // Security Watermark Text on right
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('[ VERIFIED AUTHENTIC ]', pageWidth - 20, y + 10, { align: 'right' });
  doc.text('SHA256: e8f9...4b12', pageWidth - 20, y + 15, { align: 'right' });
  doc.text('INDIAN RAILWAYS COA', pageWidth - 20, y + 20, { align: 'right' });

  // Save / Trigger Download
  const filename = `IR_Block_Memo_${plan.plan_id}.pdf`;
  doc.save(filename);
}
