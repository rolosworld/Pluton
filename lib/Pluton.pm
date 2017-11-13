package Pluton;
use Moose;
use namespace::autoclean;

use Catalyst::Runtime 5.80;

# Set flags and add plugins for the application.
#
# Note that ORDERING IS IMPORTANT here as plugins are initialized in order,
# therefore you almost certainly want to keep ConfigLoader at the head of the
# list if you're using it.
#
#         -Debug: activates the debug mode for very useful log messages
#   ConfigLoader: will load the configuration from a Config::General file in the
#                 application's home directory
# Static::Simple: will serve static files from the application's root
#                 directory

use Catalyst qw/
    -Debug
    ConfigLoader::Multi
    Static::Simple

    StackTrace

    Authentication

    Session
    Session::Store::File
    Session::State::Cookie
    /;

extends 'Catalyst';

our $VERSION = '0.01';

# Configure the application.
#
# Note that settings in pluton.conf (or other external
# configuration file that you set up manually) take precedence
# over this when using ConfigLoader. Thus configuration
# details given here can function as a default configuration,
# with an external configuration file acting as an override for
# local deployment.

__PACKAGE__->config(
    'Plugin::ConfigLoader' => {
        driver => { 'General' => { -UTF8 => 1 }, },
        file => __PACKAGE__->path_to('conf')->stringify,
    }
);

use Log::Log4perl::Catalyst;
__PACKAGE__->log(
    Log::Log4perl::Catalyst->new(
        __PACKAGE__->path_to('conf/log4perl.conf')->stringify,
        autoflush => 1
    )
);

if ( !$ENV{live} ) {
    __PACKAGE__->log->debug('Enabling memory leak check!');
    with 'CatalystX::LeakChecker';
}
with 'Main::Roles::ResourcesOptimizerApp';

# Start the application
__PACKAGE__->setup();

=head1 NAME

Pluton - Catalyst based application

=head1 SYNOPSIS


=head1 DESCRIPTION


=head1 SEE ALSO


=head1 AUTHOR

Rolando González Chévere <rolosworld@gmail.com>

=head1 LICENSE

 Copyright (c) 2017 Rolando González Chévere <rolosworld@gmail.com>
 
 This file is part of Pluton.
 
 Pluton is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 3
 as published by the Free Software Foundation.
 
 Pluton is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Pluton.  If not, see <http://www.gnu.org/licenses/>.

=cut

1;
