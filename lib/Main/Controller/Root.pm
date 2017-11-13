package Main::Controller::Root;
use Moose;
use namespace::autoclean;

BEGIN { extends 'Main::Controller' }

#
# Sets the actions in this controller to be registered with no prefix
# so they function identically to actions created in MyApp.pm
#
__PACKAGE__->config( namespace => '' );

=head1 NAME

Main::Controller::Root - Root Controller for Main

=head1 DESCRIPTION

=head1 METHODS

=head2 index

The root page (/)

=cut

sub index : Path : Args(0) {
    my ( $self, $c ) = @_;
    if ( $c->user_exists ) {
        $c->detach('/ui/index');
    }
    else {
        $c->detach('/account/login');
    }
}

=head2 unauthorized

=cut

sub unauthorized : Local {
    my ( $self, $c ) = @_;
    $c->res->body('Unauthorized');
    $c->res->code(401);
}

=head2 blank

=cut

sub blank : Local {
    my ( $self, $c ) = @_;
    $c->res->body('');
}

=head2 default

Standard 404 error page

=cut

sub default : Path {
    my ( $self, $c ) = @_;
    $c->response->body('Page not found');
    $c->response->status(404);
}

=head2 end

Attempt to render a view, if needed.

=cut

sub end : ActionClass('RenderView') {
    my ( $self, $c ) = @_;

    #$c->res->headers->header( 'Last-Modified' => localtime(), );

    if ( $ENV{live} ) {
        my $error = scalar @{ $c->error };
        if ($error) {
            $c->log->error("Errors in ${\$c->action}:");
            $c->log->error($_) for @{ $c->error };
            $c->res->status(500);
            $c->res->body('internal server error');
            $c->clear_errors;
        }
    }
}

=head2 begin

=cut

sub begin : Private {
    my ( $self, $c ) = @_;
    Log::Log4perl::MDC->put( "ip", $c->req->address );
    Log::Log4perl::MDC->put( "port", $c->config->{port} );
    Log::Log4perl::MDC->put( "host_port", $c->req->uri->host_port );
    Log::Log4perl::MDC->put( "ss_port", $ENV{SERVER_STARTER_PORT} );
    Log::Log4perl::MDC->put( "ss_generation", $ENV{SERVER_STARTER_GENERATION} );

    # Handlers
    if ( my $handlers = $c->req->params->{handlers} ) {
        $self->getObject( 'FormHandler', c => $c )->process($handlers);
    }
}

=head2 auto

    Check if there is a user and, if not, forward to login page

=cut

# Note that 'auto' runs after 'begin' but before your actions and that
# 'auto's "chain" (all from application path to most specific class are run)
# See the 'Actions' section of 'Catalyst::Manual::Intro' for more info.
sub auto : Private {
    my ( $self, $c ) = @_;

    # Disable login
    #return 1;

    # Allow unauthenticated users to reach the login page.  This
    # allows unauthenticated users to reach any action in the Login
    # controller.  To lock it down to a single action, we could use:
    #   if ($c->action eq $c->controller('Login')->action_for('index'))
    # to only allow unauthenticated access to the 'index' action we
    # added above.
    if ( $c->controller eq $self && $c->action eq $self->action_for('index') )
    {
        # We expect $self to be $c->controller('Root')
        return 1;
    }

    # User exists and is not authorized
    my $path = '/' . $c->req->path;
    if ( !$self->authorized( $c, $path ) ) {
        $c->log->debug( '***Root::auto User '
                . ( $c->user_exists ? $c->user->username : 'PUBLIC' )
                . ' not authorized:'
                . $path );
        $c->detach('/unauthorized');
        return 0;
    }

    # User found, so return 1 to continue with processing after this 'auto'
    return 1;
}

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

__PACKAGE__->meta->make_immutable;

1;
