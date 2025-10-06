-- Add comprehensive South African advocate rate templates
-- Based on South African Bar Council guidelines and market rates

-- Clear existing templates to avoid duplicates
DELETE FROM standard_service_templates WHERE is_system_template = true;

-- JUNIOR COUNSEL TEMPLATES (Newly Admitted - 0-3 Years)
-- Hourly rates: R700 - R1,700

INSERT INTO standard_service_templates (
  template_name, template_description, service_category, matter_types,
  default_hourly_rate, default_fixed_fee, estimated_hours, bar_association
) VALUES

-- Junior Counsel - Consultation Services
('Junior Counsel - Initial Consultation', 'Initial client consultation and case assessment (Junior Counsel)', 'consultation', ARRAY['general'], 1200.00, NULL, 1.0, NULL),
('Junior Counsel - Follow-up Consultation', 'Follow-up consultation with client (Junior Counsel)', 'consultation', ARRAY['general'], 1200.00, NULL, 0.5, NULL),
('Junior Counsel - Conference with Attorney', 'Conference with instructing attorney (Junior Counsel)', 'consultation', ARRAY['general'], 1200.00, NULL, 1.0, NULL),

-- Junior Counsel - Research Services
('Junior Counsel - Legal Research', 'Comprehensive legal research and analysis (Junior Counsel)', 'research', ARRAY['general'], 1000.00, NULL, 4.0, NULL),
('Junior Counsel - Case Law Research', 'Research of relevant case law and precedents (Junior Counsel)', 'research', ARRAY['general'], 1000.00, NULL, 3.0, NULL),
('Junior Counsel - Statutory Research', 'Research of applicable legislation (Junior Counsel)', 'research', ARRAY['general'], 1000.00, NULL, 2.0, NULL),

-- Junior Counsel - Drafting Services
('Junior Counsel - Simple Pleadings', 'Drafting of simple court pleadings (Junior Counsel)', 'drafting', ARRAY['litigation'], 1200.00, NULL, 4.0, NULL),
('Junior Counsel - Particulars of Claim', 'Drafting particulars of claim (Junior Counsel)', 'drafting', ARRAY['litigation'], 1200.00, NULL, 5.0, NULL),
('Junior Counsel - Notice of Motion', 'Drafting notice of motion and founding affidavit (Junior Counsel)', 'drafting', ARRAY['litigation'], 1200.00, NULL, 6.0, NULL),
('Junior Counsel - Legal Opinion', 'Drafting legal opinion (Junior Counsel)', 'drafting', ARRAY['general'], 1400.00, NULL, 4.0, NULL),

-- Junior Counsel - Court Appearances (Scale A - Basic Matters)
('Junior Counsel - Magistrate Court Appearance', 'Appearance in Magistrate Court (Junior Counsel, Scale A)', 'court_appearance', ARRAY['litigation'], 1500.00, NULL, 4.0, NULL),
('Junior Counsel - Motion Court', 'Motion court appearance (Junior Counsel, Scale A)', 'court_appearance', ARRAY['litigation'], 1500.00, NULL, 2.0, NULL),
('Junior Counsel - Case Management', 'Case management conference (Junior Counsel)', 'court_appearance', ARRAY['litigation'], 1200.00, NULL, 2.0, NULL),

-- Junior Counsel - Document Review
('Junior Counsel - Document Review', 'Review and analysis of legal documents (Junior Counsel)', 'document_review', ARRAY['general'], 1000.00, NULL, 3.0, NULL),
('Junior Counsel - Contract Review', 'Review of contracts and agreements (Junior Counsel)', 'document_review', ARRAY['commercial'], 1200.00, NULL, 2.0, NULL),

-- MID-LEVEL ADVOCATES (3-10 Years Experience)
-- Hourly rates: R1,200 - R3,000

-- Mid-Level - Consultation Services
('Mid-Level - Initial Consultation', 'Initial client consultation and case assessment (Mid-Level)', 'consultation', ARRAY['general'], 2000.00, NULL, 1.0, NULL),
('Mid-Level - Expert Consultation', 'Consultation with expert witnesses (Mid-Level)', 'consultation', ARRAY['general'], 2200.00, NULL, 1.5, NULL),
('Mid-Level - Strategy Conference', 'Strategic case planning conference (Mid-Level)', 'consultation', ARRAY['general'], 2200.00, NULL, 2.0, NULL),

-- Mid-Level - Research Services
('Mid-Level - Complex Legal Research', 'Complex legal research and analysis (Mid-Level)', 'research', ARRAY['general'], 2000.00, NULL, 5.0, NULL),
('Mid-Level - Constitutional Research', 'Constitutional law research (Mid-Level)', 'research', ARRAY['constitutional'], 2500.00, NULL, 6.0, NULL),
('Mid-Level - Comparative Law Research', 'Comparative and foreign law research (Mid-Level)', 'research', ARRAY['general'], 2200.00, NULL, 4.0, NULL),

-- Mid-Level - Drafting Services
('Mid-Level - Complex Pleadings', 'Drafting complex court pleadings (Mid-Level, Scale B)', 'drafting', ARRAY['litigation'], 2500.00, NULL, 6.0, NULL),
('Mid-Level - Heads of Argument', 'Drafting heads of argument (Mid-Level, Scale B)', 'drafting', ARRAY['litigation'], 2800.00, NULL, 8.0, NULL),
('Mid-Level - Application Papers', 'Drafting application papers (Mid-Level)', 'drafting', ARRAY['litigation'], 2500.00, NULL, 8.0, NULL),
('Mid-Level - Legal Opinion', 'Comprehensive legal opinion (Mid-Level)', 'drafting', ARRAY['general'], 2500.00, NULL, 5.0, NULL),
('Mid-Level - Commercial Contract', 'Drafting commercial contracts (Mid-Level)', 'drafting', ARRAY['commercial'], 2500.00, NULL, 6.0, NULL),

-- Mid-Level - Court Appearances (Scale B - Moderately Complex)
('Mid-Level - High Court Trial', 'High Court trial appearance (Mid-Level, Scale B)', 'court_appearance', ARRAY['litigation'], 3000.00, NULL, 8.0, NULL),
('Mid-Level - High Court Motion', 'High Court motion proceedings (Mid-Level, Scale B)', 'court_appearance', ARRAY['litigation'], 2500.00, NULL, 4.0, NULL),
('Mid-Level - Opposed Application', 'Opposed application hearing (Mid-Level)', 'court_appearance', ARRAY['litigation'], 2800.00, NULL, 6.0, NULL),
('Mid-Level - Arbitration Hearing', 'Arbitration hearing (Mid-Level)', 'court_appearance', ARRAY['commercial'], 2800.00, NULL, 8.0, NULL),

-- Mid-Level - Criminal Law
('Mid-Level - Criminal Trial', 'Criminal trial (Mid-Level)', 'court_appearance', ARRAY['criminal'], 2500.00, NULL, 8.0, NULL),
('Mid-Level - Bail Application', 'Bail application (Mid-Level)', 'court_appearance', ARRAY['criminal'], NULL, 15000.00, 4.0, NULL),
('Mid-Level - Sentencing Hearing', 'Sentencing hearing (Mid-Level)', 'court_appearance', ARRAY['criminal'], 2500.00, NULL, 4.0, NULL),

-- Mid-Level - Negotiation
('Mid-Level - Settlement Negotiation', 'Settlement negotiation (Mid-Level)', 'negotiation', ARRAY['litigation'], 2500.00, NULL, 4.0, NULL),
('Mid-Level - Commercial Negotiation', 'Commercial contract negotiation (Mid-Level)', 'negotiation', ARRAY['commercial'], 2800.00, NULL, 6.0, NULL),

-- EXPERIENCED SPECIALISTS (10+ Years, Specialized Fields)
-- Hourly rates: R3,500 - R5,000+

-- Specialist - Consultation Services
('Specialist - Expert Consultation', 'Expert consultation in specialized field', 'consultation', ARRAY['general'], 4000.00, NULL, 1.5, NULL),
('Specialist - Strategic Advisory', 'Strategic legal advisory services', 'consultation', ARRAY['general'], 4500.00, NULL, 2.0, NULL),

-- Specialist - Research Services
('Specialist - Advanced Research', 'Advanced legal research in specialized field', 'research', ARRAY['general'], 3800.00, NULL, 6.0, NULL),
('Specialist - Constitutional Research', 'Constitutional Court level research', 'research', ARRAY['constitutional'], 4500.00, NULL, 8.0, NULL),

-- Specialist - Drafting Services
('Specialist - Complex Heads of Argument', 'Complex heads of argument (Specialist, Scale C)', 'drafting', ARRAY['litigation'], 4500.00, NULL, 10.0, NULL),
('Specialist - Constitutional Application', 'Constitutional Court application papers', 'drafting', ARRAY['constitutional'], 5000.00, NULL, 12.0, NULL),
('Specialist - Expert Opinion', 'Expert legal opinion in specialized field', 'drafting', ARRAY['general'], 4500.00, NULL, 6.0, NULL),
('Specialist - Complex Commercial Contract', 'Complex commercial contract drafting', 'drafting', ARRAY['commercial'], 4500.00, NULL, 8.0, NULL),

-- Specialist - Court Appearances (Scale C - Highly Complex)
('Specialist - Complex High Court Trial', 'Complex High Court trial (Specialist, Scale C)', 'court_appearance', ARRAY['litigation'], 4500.00, NULL, 10.0, NULL),
('Specialist - Appeal Court Appearance', 'Supreme Court of Appeal appearance', 'court_appearance', ARRAY['litigation'], NULL, 35000.00, 10.0, NULL),
('Specialist - Constitutional Court', 'Constitutional Court appearance', 'court_appearance', ARRAY['constitutional'], NULL, 45000.00, 12.0, NULL),
('Specialist - Complex Commercial Litigation', 'Complex commercial litigation (Scale C)', 'court_appearance', ARRAY['commercial'], 4500.00, NULL, 10.0, NULL),

-- Specialist - Due Diligence
('Specialist - M&A Due Diligence', 'Mergers and acquisitions due diligence', 'document_review', ARRAY['commercial'], 4000.00, NULL, 20.0, NULL),
('Specialist - Regulatory Compliance Review', 'Regulatory compliance review', 'document_review', ARRAY['commercial'], 4000.00, NULL, 15.0, NULL),

-- SENIOR COUNSEL (SILKS)
-- Daily rates: R28,000 - R45,000 (R3,500 - R5,625 per hour based on 8-hour day)

-- Senior Counsel - Consultation
('Senior Counsel - Expert Consultation', 'Expert consultation (Senior Counsel)', 'consultation', ARRAY['general'], NULL, 15000.00, 2.0, NULL),
('Senior Counsel - Strategic Conference', 'Strategic case conference (Senior Counsel)', 'consultation', ARRAY['general'], NULL, 20000.00, 3.0, NULL),

-- Senior Counsel - Drafting
('Senior Counsel - Heads of Argument', 'Heads of argument (Senior Counsel)', 'drafting', ARRAY['litigation'], NULL, 35000.00, 10.0, NULL),
('Senior Counsel - Constitutional Papers', 'Constitutional Court papers (Senior Counsel)', 'drafting', ARRAY['constitutional'], NULL, 50000.00, 12.0, NULL),
('Senior Counsel - Expert Opinion', 'Expert legal opinion (Senior Counsel)', 'drafting', ARRAY['general'], NULL, 30000.00, 6.0, NULL),

-- Senior Counsel - Court Appearances
('Senior Counsel - High Court Trial Day', 'High Court trial per day (Senior Counsel)', 'court_appearance', ARRAY['litigation'], NULL, 35000.00, 8.0, NULL),
('Senior Counsel - Appeal Court Day', 'Supreme Court of Appeal per day (Senior Counsel)', 'court_appearance', ARRAY['litigation'], NULL, 40000.00, 8.0, NULL),
('Senior Counsel - Constitutional Court Day', 'Constitutional Court per day (Senior Counsel)', 'court_appearance', ARRAY['constitutional'], NULL, 45000.00, 8.0, NULL),
('Senior Counsel - Complex Commercial Day', 'Complex commercial matter per day (Senior Counsel)', 'court_appearance', ARRAY['commercial'], NULL, 35000.00, 8.0, NULL),

-- GENERAL SERVICES (All Levels)

-- Correspondence
('Legal Correspondence - Standard', 'Drafting legal correspondence', 'correspondence', ARRAY['general'], 1500.00, NULL, 0.5, NULL),
('Legal Correspondence - Complex', 'Complex legal correspondence', 'correspondence', ARRAY['general'], 2000.00, NULL, 1.0, NULL),
('Letter of Demand', 'Drafting letter of demand', 'correspondence', ARRAY['general'], NULL, 3500.00, 1.5, NULL),

-- Filing Services
('Court Filing - Standard', 'Filing of court documents', 'filing', ARRAY['litigation'], NULL, 2000.00, 1.0, NULL),
('Urgent Court Filing', 'Urgent court filing and service', 'filing', ARRAY['litigation'], NULL, 3500.00, 2.0, NULL),
('CIPC Filing', 'Company registration and CIPC filings', 'filing', ARRAY['commercial'], NULL, 3000.00, 2.0, NULL),

-- Travel and Waiting Time
('Travel Time - Local', 'Travel time within city', 'travel', ARRAY['general'], 1000.00, NULL, NULL, NULL),
('Travel Time - Regional', 'Travel time to regional courts', 'travel', ARRAY['general'], 1500.00, NULL, NULL, NULL),
('Travel Time - National', 'Travel time to other provinces', 'travel', ARRAY['general'], 2000.00, NULL, NULL, NULL),
('Waiting Time - Court', 'Waiting time at court', 'other', ARRAY['general'], 800.00, NULL, NULL, NULL),

-- SPECIALIZED PRACTICE AREAS

-- Family Law
('Family Law - Divorce Consultation', 'Divorce matter consultation', 'consultation', ARRAY['family'], 2000.00, NULL, 1.5, NULL),
('Family Law - Maintenance Application', 'Maintenance application', 'court_appearance', ARRAY['family'], NULL, 12000.00, 4.0, NULL),
('Family Law - Custody Hearing', 'Child custody hearing', 'court_appearance', ARRAY['family'], 2500.00, NULL, 6.0, NULL),

-- Labour Law
('Labour Law - CCMA Representation', 'CCMA arbitration representation', 'court_appearance', ARRAY['labour'], 2500.00, NULL, 8.0, NULL),
('Labour Law - Unfair Dismissal', 'Unfair dismissal case', 'court_appearance', ARRAY['labour'], 2800.00, NULL, 8.0, NULL),
('Labour Law - Contract Review', 'Employment contract review', 'document_review', ARRAY['labour'], 2000.00, NULL, 2.0, NULL),

-- Property Law
('Property Law - Transfer Opinion', 'Property transfer legal opinion', 'drafting', ARRAY['property'], 2500.00, NULL, 3.0, NULL),
('Property Law - Eviction Application', 'Eviction application', 'court_appearance', ARRAY['property'], NULL, 15000.00, 6.0, NULL),
('Property Law - Lease Agreement Review', 'Commercial lease agreement review', 'document_review', ARRAY['property'], 2200.00, NULL, 3.0, NULL),

-- Insolvency and Business Rescue
('Insolvency - Liquidation Application', 'Company liquidation application', 'court_appearance', ARRAY['insolvency'], 3500.00, NULL, 8.0, NULL),
('Insolvency - Business Rescue Plan', 'Business rescue plan drafting', 'drafting', ARRAY['insolvency'], 3500.00, NULL, 15.0, NULL),
('Insolvency - Creditors Meeting', 'Creditors meeting representation', 'other', ARRAY['insolvency'], 2500.00, NULL, 4.0, NULL),

-- Tax Law
('Tax Law - SARS Objection', 'SARS tax objection drafting', 'drafting', ARRAY['tax'], 3000.00, NULL, 6.0, NULL),
('Tax Law - Tax Court Appeal', 'Tax Court appeal representation', 'court_appearance', ARRAY['tax'], 3500.00, NULL, 8.0, NULL),
('Tax Law - Tax Advisory', 'Tax planning and advisory', 'consultation', ARRAY['tax'], 3500.00, NULL, 2.0, NULL),

-- Administrative Law
('Administrative Law - PAJA Review', 'PAJA review application', 'drafting', ARRAY['administrative'], 3500.00, NULL, 10.0, NULL),
('Administrative Law - Judicial Review', 'Judicial review proceedings', 'court_appearance', ARRAY['administrative'], 3500.00, NULL, 8.0, NULL),

-- LEGAL AID RATES (For Pro Bono Reference)
('Legal Aid - Senior Counsel Rate', 'Legal Aid SA Senior Counsel strategic litigation rate', 'consultation', ARRAY['general'], 3148.00, NULL, 1.0, NULL),
('Legal Aid - Standard Rate', 'Legal Aid SA standard rate', 'consultation', ARRAY['general'], 2100.00, NULL, 1.0, NULL);

-- Add bar-specific templates for major centers

-- Johannesburg Bar specific rates (typically 10-20% higher)
INSERT INTO standard_service_templates (
  template_name, template_description, service_category, matter_types,
  default_hourly_rate, default_fixed_fee, estimated_hours, bar_association
) VALUES
('Johannesburg Bar - Mid-Level Trial', 'High Court trial (Johannesburg Bar premium)', 'court_appearance', ARRAY['litigation'], 3300.00, NULL, 8.0, 'johannesburg'),
('Johannesburg Bar - Commercial Litigation', 'Complex commercial litigation (Johannesburg)', 'court_appearance', ARRAY['commercial'], 5000.00, NULL, 10.0, 'johannesburg');

-- Cape Bar specific rates
INSERT INTO standard_service_templates (
  template_name, template_description, service_category, matter_types,
  default_hourly_rate, default_fixed_fee, estimated_hours, bar_association
) VALUES
('Cape Bar - Constitutional Matter', 'Constitutional Court matter (Cape Bar)', 'court_appearance', ARRAY['constitutional'], NULL, 45000.00, 12.0, 'cape_town'),
('Cape Bar - Commercial Advisory', 'Commercial legal advisory (Cape Bar)', 'consultation', ARRAY['commercial'], 4000.00, NULL, 2.0, 'cape_town');

-- Add comments for guidance
COMMENT ON TABLE standard_service_templates IS 'Standard rate templates based on South African Bar Council guidelines and market rates. Junior Counsel: R700-R1,700/hr, Mid-Level: R1,200-R3,000/hr, Specialists: R3,500-R5,000/hr, Senior Counsel: R28,000-R45,000/day';
