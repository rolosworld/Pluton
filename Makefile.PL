#!/usr/bin/env perl
# IMPORTANT: if you delete this file your app will not work as
# expected.  You have been warned.
use inc::Module::Install;
use Module::Install::Catalyst; # Complain loudly if you don't have
                               # Catalyst::Devel installed or haven't said
                               # 'make dist' to create a standalone tarball.

name 'Pluton';
all_from 'lib/Pluton.pm';

requires 'Test::Class';
requires 'Test::WWW::Mechanize::Catalyst';
requires 'Sub::Identify';
requires 'Data::Dumper';
requires 'DateTime';
requires 'DateTime::Format::Strptime';
requires 'DateTime::Format::Pg';

requires 'Catalyst::Runtime' => '5.80032';
requires 'Catalyst::ScriptRunner';
requires 'Catalyst::Helper';
requires 'Catalyst::Devel';
requires 'Catalyst::Engine::HTTP';

requires 'Catalyst::Plugin::ConfigLoader';
requires 'Catalyst::Plugin::ConfigLoader::Multi';
requires 'Catalyst::Plugin::Static::Simple';
requires 'Catalyst::Plugin::Authentication';
requires 'Catalyst::Plugin::Session';
requires 'Catalyst::Plugin::Session::Store::File';
requires 'Catalyst::Plugin::Session::State::Cookie';
requires 'Catalyst::Plugin::StackTrace';
requires 'Catalyst::Plugin::Unicode';
requires 'Catalyst::Plugin::Unicode::Encoding';
requires 'Catalyst::Plugin::Cache';

requires 'Catalyst::Action::RenderView';

requires 'Catalyst::Model::Adaptor';

requires 'Catalyst::View::TT';
requires 'Catalyst::View::JSON';

requires 'Moose';
requires 'namespace::autoclean';
requires 'Config::General'; # This should reflect the config file format you've chosen
                 # See Catalyst::Plugin::ConfigLoader for supported formats

requires 'Acme::LOLCAT';

requires 'Text::Diff';
requires 'Perl6::Slurp';
requires 'Perl::Critic';
requires 'Crypt::SaltedHash';
requires 'Eval::Closure';
requires 'aliased';
requires 'List::MoreUtils';
requires 'Log::Log4perl::Catalyst';
requires 'Email::Valid';
requires 'Data::FormValidator';
requires 'Data::FormValidator::Constraints::MethodsFactory';
requires 'Data::FormValidator::Constraints::Dates';
requires 'Data::Types';
requires 'MooseX::NonMoose';
requires 'MooseX::MarkAsMethods';
requires 'DBIx::Class::Schema::Loader';
requires 'String::ToIdentifier::EN';
requires 'Lingua::EN::Inflect::Phrase';
requires 'Lingua::EN::Tagger';
requires 'HTML::Tagset';
requires 'MooseX::Emulate::Class::Accessor::Fast';
requires 'MooseX::Types';
requires 'MooseX::Getopt';
requires 'MooseX::Types::LoadableClass';
requires 'MooseX::Types::Common::Numeric';
requires 'MooseX::MethodAttributes::Inheritable';
requires 'File::Copy::Recursive';
requires 'Params::Classify';
requires 'Variable::Magic';
requires 'Params::Validate';
requires 'MooseX::Role::WithOverloading';
requires 'Digest::SHA1';
requires 'Class::Accessor::Fast';
requires 'HTML::Entities';
requires 'Template';
requires 'DBI';
requires 'DBD::Pg';
requires 'List::MoreUtils';
requires 'Protocol::WebSocket::Handshake::Server';
requires 'AnyEvent::Handle';
requires 'Twiggy::Server';
requires 'CGI::FormBuilder';
requires 'PDF::API2';
requires 'Template::Plugin::JSON';
requires 'Modern::Perl';
requires 'DateTime::Format::DateParse';
requires 'Term::Size::Any';
requires 'Term::ReadLine::Gnu';
requires 'HTML::Packer';
requires 'JavaScript::Packer';
requires 'CSS::Packer';
requires 'JSON::XS';
requires 'Server::Starter';
requires 'YAML';
requires 'YAML::XS';
requires 'JSON::Validator';
requires 'Plack::Handler::Gazelle';
requires 'DBIx::ParseDSN';
requires 'CatalystX::LeakChecker';
requires 'Captcha::reCAPTCHA';
requires 'Crypt::Cipher::AES';
requires 'Imager::QRCode';
requires 'Crypt::CBC';
requires 'Crypt::PBKDF2';
requires 'MIME::Base64::URLSafe';
requires 'MIME::Base32';
requires 'AnyEvent::WebSocket::Client';

test_requires 'Test::More' => '0.88';
catalyst;

auto_install;
tests_recursive();
WriteAll;
